"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type ProctorStatus = "starting" | "active" | "denied" | "lost";

export interface ProctorState {
  status: ProctorStatus;
  /** null = detector unavailable (presence is then assumed). */
  facePresent: boolean | null;
  faceDetectorAvailable: boolean;
  /** 0..1 microphone RMS level. */
  audioLevel: number;
  noisy: boolean;
}

interface Options {
  active: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
  onCameraLost: () => void;
  onFaceMissing: () => void;
}

/** Minimal typing for the Shape Detection API (Chromium, behind a flag on some builds). */
interface FaceDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<unknown[]>;
}
type FaceDetectorCtor = new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => FaceDetectorLike;

const FACE_MISSING_MS = 6000;

/**
 * Live proctoring: camera + microphone stream attached to a <video>, audio
 * level via an AnalyserNode and, where the browser provides it, face presence
 * via the Shape Detection API. All analysis runs on-device; nothing leaves
 * the browser.
 */
export function useProctoring({ active, videoRef, onCameraLost, onFaceMissing }: Options): ProctorState {
  const [state, setState] = useState<ProctorState>({
    status: "starting",
    facePresent: null,
    faceDetectorAvailable: false,
    audioLevel: 0,
    noisy: false,
  });
  const cb = useRef({ onCameraLost, onFaceMissing });
  useEffect(() => {
    cb.current = { onCameraLost, onFaceMissing };
  });

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    let cancelled = false;
    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;
    let audioTimer: number | undefined;
    let faceTimer: number | undefined;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: true });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, status: "denied" }));
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => undefined);
      }
      setState((s) => ({ ...s, status: "active" }));

      stream.getVideoTracks().forEach((t) => {
        t.addEventListener("ended", () => {
          if (cancelled) return;
          setState((s) => ({ ...s, status: "lost" }));
          cb.current.onCameraLost();
        });
      });

      // Audio level meter
      try {
        audioCtx = new AudioContext();
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        let noisyTicks = 0;
        audioTimer = window.setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) {
            const v = (buf[i] - 128) / 128;
            sum += v * v;
          }
          const rms = Math.sqrt(sum / buf.length);
          noisyTicks = rms > 0.28 ? noisyTicks + 1 : Math.max(0, noisyTicks - 1);
          setState((s) => ({ ...s, audioLevel: rms, noisy: noisyTicks >= 4 }));
        }, 250);
      } catch {
        /* audio analysis unavailable */
      }

      // Face presence (Shape Detection API)
      const Ctor = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
      if (Ctor) {
        let detector: FaceDetectorLike | null = null;
        try {
          detector = new Ctor({ fastMode: true, maxDetectedFaces: 2 });
        } catch {
          detector = null;
        }
        if (detector) {
          setState((s) => ({ ...s, faceDetectorAvailable: true, facePresent: true }));
          let missingSince: number | null = null;
          let reported = false;
          faceTimer = window.setInterval(async () => {
            const v = videoRef.current;
            if (!v || v.readyState < 2 || !detector) return;
            try {
              const faces = await detector.detect(v);
              const present = faces.length > 0;
              if (present) {
                missingSince = null;
                reported = false;
              } else {
                missingSince ??= Date.now();
                if (!reported && Date.now() - missingSince > FACE_MISSING_MS) {
                  reported = true;
                  cb.current.onFaceMissing();
                }
              }
              setState((s) => (s.facePresent === present ? s : { ...s, facePresent: present }));
            } catch {
              /* detector failed on this frame */
            }
          }, 1500);
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearInterval(audioTimer);
      window.clearInterval(faceTimer);
      audioCtx?.close().catch(() => undefined);
      stream?.getTracks().forEach((t) => t.stop());
      if (video) video.srcObject = null;
    };
  }, [active, videoRef]);

  return state;
}
