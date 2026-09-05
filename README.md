# SankhyaSetu

**Skills. Evidence. Impact.** — a Smart India Hackathon 2026 prototype for the Ministry of Statistics and Programme Implementation (Data Informatics & Innovation Division).

SankhyaSetu is a competency and evidence layer around **iGOT Karmayogi**, **NSSTA** and **TPAC**. It never hosts course content. It identifies skill gaps for an officer's role, recommends provider programmes, verifies completion, runs a proctored assessment and updates the competency profile — but only when all three hold:

> course completion **+** assessment pass **+** valid integrity → competency update

Completion alone never raises a competency. That gate is the product argument and it is enforced in `src/lib/assessment/scoring.ts`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
```

Production check: `npm run build && npm start`.

Sign in with any demo account on the login screen (Parichay SSO is simulated). Everything is client-side; the journey persists in `sessionStorage` for the tab.

## Demo journey

1. **Login** → demo account or "Continue with Parichay SSO"
2. **Dashboard** → overall competency, skill gaps, recommendations
3. **My Competency** → domain chart, gap table, assessment history
4. **Learning Recommendations** → ranked programmes, provider catalogues with filters
5. **Course Details** → why it is recommended, link out to the provider
6. **Learning Evidence** → verified / in-progress / pending completions
7. **Assessments** → unlocked by verified evidence; locked while verification is pending
8. **Pre-flight** → rules, camera/mic test, declaration
9. **Full-screen attempt** → live proctoring, navigator, flags, timer
10. **Result** → score, integrity verdict, topic breakdown, competency impact
11. **Progress** → before/after comparison and radar; **Competency Update** detail
12. **Assessment Studio** → upload material, simulated retrieval pipeline, generate and publish a new assessment

Settings → *Reset demo journey* clears the tab state between demos.

## Anti-cheat mechanisms (`src/components/assessment/`)

| Mechanism | Severity | Notes |
|---|---|---|
| Full-screen enforced; exit detected | Critical | Blocking dialog until full screen is restored |
| Tab switch / window minimised | Critical | `visibilitychange` |
| Focus moved to another app | Critical | `window.blur` (debounced against tab switch) |
| Camera feed interrupted | Critical | video track `ended` |
| Developer tools docked | Critical | viewport-vs-window delta while in full screen |
| Copy / cut / paste, right-click, drag | Minor | Blocked and recorded |
| Keyboard shortcuts (Ctrl/Cmd+C/V/X/A/P/S/U/F…, F11, F12, Ctrl+Shift+I/J/C) | Minor | Blocked and recorded |
| PrintScreen | Minor | Clipboard cleared, recorded |
| Face not visible > 6 s | Minor | Shape Detection API where available; presence assumed elsewhere |
| Page reload | Minor | Attempt resumes with the same order and deadline |
| Browser back | — | Trapped |
| Question + option order | — | Seeded shuffle per attempt |
| Timer | — | Absolute deadline; auto-submits at zero |

Three **critical** events auto-submit the attempt and mark it **invalid**; an invalid or failed attempt applies no competency change. Microphone level is metered on-device; nothing is uploaded.

## What is simulated (by design)

Parichay SSO, iGOT/NSSTA/TPAC integrations, the competency framework snapshot, question generation (curated topic-tagged banks behind a retrieval-shaped interface) and face/object detection where the browser has no detector. Each is labelled in the UI; the code is shaped so real services can replace the mocks without touching components.

## Structure

```
src/app/(app)/…        authenticated screens inside the shell
src/app/(exam)/…       chrome-less full-screen attempt
src/components/        shell, ui primitives, charts, assessment engine
src/lib/data/          competencies, courses, evidence, question banks, assessments
src/lib/store/         client store (sessionStorage-backed)
src/lib/assessment/    scoring, integrity and competency-impact rules
public/images/         design assets cropped from the UI mockups
tools/                 crop-assets.mjs, screenshot.mjs (Playwright smoke test)
```

`node tools/screenshot.mjs http://localhost:3000` signs in, screenshots every screen at desktop and mobile widths and runs a full proctored attempt with a fake camera.
