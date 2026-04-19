Help me with your contributions.
i tried so far

# Mindscribe — AI Wellness Browser Extension

> A values-aware, emotionally intelligent journaling companion that lives in your browser sidebar. Write freely in any notes app — Mindscribe reads between the lines, reflects your values back to you, and offers psychological support rooted in CBT, ACT, and Schwartz's Basic Human Values theory.

---

## What it does

Mindscribe is a Chrome (and Firefox) browser extension that attaches a persistent sidebar to any web-based writing environment — Notion, Google Docs, Bear Web, standard textareas — and quietly analyses what you write as you pause between thoughts.

When you stop typing for a few seconds, the extension runs your text through an on-device AI pipeline that detects your emotional tone, identifies which of your core personal values are present or in tension, and generates a warm, psychologically informed response. The response might mirror your feeling back to you, offer a gentle reframe using CBT language, prompt acceptance in the ACT tradition, or simply ask an open question that helps you go deeper.

Everything runs locally. Your journal text never leaves your device.

---

## Core features

**Values detection** — Using Schwartz's Basic Human Values theory as a framework, the extension identifies which values (Self-direction, Benevolence, Achievement, Security, Universalism, and others) appear most strongly in your writing. Over time it builds a personal values profile stored only in your browser's local storage.

**Emotional tone analysis** — An on-device sentiment model (powered by Transformers.js and distilbert-base-uncased) classifies the primary emotion and intensity of your writing across Plutchik's emotion wheel — without sending a single character to any server.

**Psychological response modes** — Depending on what it detects, the AI selects the most appropriate response mode: Reflective (mirroring the feeling), Reframe (gentle cognitive shift from CBT), Grounding (calming presence for high-distress states), or Amplification (deepening positive emotion).

**Crisis safety layer** — Before any AI analysis runs, a fast on-device regex classifier checks for crisis signals. If detected, the extension immediately shows crisis helpline information and warm human language — never an AI-generated response.

**Works everywhere you write** — The content script uses MutationObserver to detect writing environments on any page, including single-page apps like Notion. Special handling is included for Google Docs' canvas-based editor.

**Privacy by design** — No backend, no database, no cloud sync. The values profile and analysis history live in `chrome.storage.local` and can be exported or deleted at any time from the sidebar.

---

## Psychological frameworks

The AI responses are grounded in four established frameworks from psychology and counselling:

**Schwartz's Basic Human Values Theory** — A cross-cultural model of ten universal values that shape motivation and behaviour. The extension uses keyword pattern matching to identify which values are most present in the user's writing and tracks how these shift over sessions.

**Cognitive Behavioural Therapy (CBT)** — When the AI detects cognitive distortions such as catastrophising, all-or-nothing thinking, or negative self-attribution, it gently names the pattern and offers a reframe using CBT-informed language. It never labels or diagnoses — it reflects and invites reconsideration.

**Acceptance and Commitment Therapy (ACT)** — For emotions the user appears to be resisting or suppressing, the AI uses ACT-inspired prompts that encourage acceptance rather than avoidance. The goal is to reduce the struggle with difficult feelings, not to eliminate them.

**Plutchik's Wheel of Emotions** — The emotion detection model maps sentiment to Plutchik's eight primary emotions (joy, trust, fear, surprise, sadness, disgust, anger, anticipation) and estimates intensity. This gives the response generator the context it needs to choose the most appropriate tone.

---

## Technical architecture

### Extension layer
- Built with **Plasmo** (Manifest V3 framework) and React + TypeScript
- Uses Chrome's `sidePanel` API for a persistent, non-intrusive sidebar
- Content script listens for `input` and `keyup` events, debounced by 4 seconds
- MutationObserver handles dynamic single-page apps
- Background service worker relays messages between content script and sidebar

### AI layer (fully on-device)
- **Transformers.js** (`@xenova/transformers`) runs Hugging Face models directly in the browser
- Emotion model: `Xenova/distilbert-base-uncased-finetuned-sst-2-english` (~67MB, cached after first load)
- Intensity model: `Xenova/bert-base-multilingual-uncased-sentiment`
- Values detection: rule-based keyword matching against Schwartz's value taxonomy
- Response generation: template-based with CBT/ACT/Reflective/Amplification modes
- Models are lazy-loaded and cached — works offline after first download

### Safety layer
- `crisisDetector.ts` runs synchronously on every text input before AI analysis
- Pure regex-based — no model, no network, no latency
- On crisis signal: shows helpline resources immediately, bypasses all AI

### Storage
- `chrome.storage.local` only — no external database
- Stores: values profile (value name → frequency count), last 20 analysis results, session count, enable/disable flag
- Full user control: export and clear all data from the sidebar UI

### State management
- **Zustand** for sidebar state (analysis result, loading states, active tab)
- **Zod** for safe parsing of all AI output
- `useAnalysis` custom hook orchestrates the full pipeline

---

## Project structure

```
mindscribe/
├── src/
│   ├── background/
│   │   └── index.ts          # Service worker — message relay, side panel toggle
│   ├── content/
│   │   └── index.ts          # Text capture, debouncing, page detection
│   ├── sidepanel/
│   │   ├── index.tsx          # Main sidebar panel (idle / loading / result states)
│   │   └── ProfileView.tsx    # Values-over-time profile bar chart
│   ├── lib/
│   │   ├── emotionEngine.ts   # Transformers.js sentiment + intensity pipeline
│   │   ├── valuesEngine.ts    # Schwartz keyword matcher + profile builder
│   │   ├── responseGenerator.ts # CBT/ACT/Reflective template engine
│   │   ├── crisisDetector.ts  # On-device regex safety check
│   │   └── storage.ts         # chrome.storage.local typed wrappers
│   └── hooks/
│       └── useAnalysis.ts     # Orchestration hook
├── public/
│   └── privacy.html           # Privacy policy (required for Chrome Web Store)
├── package.json
├── plasmo.config.ts
└── tailwind.config.js
```

---

## Getting started

### Prerequisites
- Node.js 20+
- pnpm (`corepack enable && corepack prepare pnpm@latest --activate`)
- A GitHub Codespace or local development environment

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/mindscribe-extension
cd mindscribe-extension

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

### Loading in Chrome (development)

1. Run `pnpm build`
2. Open `chrome://extensions` in Chrome
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked**
5. Select the `build/chrome-mv3-dev` folder

### Building for production

```bash
pnpm build
# Output: build/chrome-mv3-prod/

# Package for submission
cd build/chrome-mv3-prod && zip -r ../../mindscribe.zip . && cd ../..
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `@xenova/transformers` | On-device Hugging Face models (emotion analysis) |
| `zustand` | Lightweight sidebar state management |
| `zod` | Safe runtime validation of AI output |
| `tailwindcss` | Utility-first sidebar styling |
| `plasmo` | Chrome/Firefox Extension framework (Manifest V3) |

No paid APIs. No backend. No cloud services required.

---

## Ethics and safety

Mindscribe is designed to be a **compassionate witness**, not a therapist. The following ethical principles are hard-coded into every layer of the system:

**Informed consent** — Analysis only activates when the user enables it. A visible indicator ("Mindscribe active") is always shown when the extension is reading. A one-click pause button is always accessible.

**Scope boundaries** — The AI never diagnoses, never prescribes, and never claims certainty about a user's inner state. When distress intensity is high, a plain-language disclaimer is appended: "This is a reflective companion, not therapy. For persistent distress, speaking with a counsellor can help."

**Crisis escalation** — If the crisis detector flags the text, the extension immediately shows warm language and real helpline numbers. The AI never responds to crisis signals. No AI-generated response is ever shown for crisis content.

**Local-first data** — Journal text is transmitted only within the browser (content script → background → sidebar). It is never stored externally. The only outbound network request is the one-time model download from Hugging Face's CDN.

**No dependency fostering** — The AI explicitly encourages external support — journaling practices, trusted people, professional counselling — and does not position itself as a substitute for human connection.

**Toxic positivity filter** — The response generator includes a filter that blocks phrases like "just think positive" or "it could be worse". Responses must acknowledge difficulty before offering any reframe.

---

## Crisis resources (India)

If the extension detects a crisis signal, the following resources are shown:

| Organisation | Number | Hours |
|---|---|---|
| iCall (TISS) | 9152987821 | Mon–Sat, 8am–10pm |
| Vandrevala Foundation | 1860-2662-345 | 24 / 7 |
| SNEHI | 044-24640050 | Mon–Sat, 8am–10pm |

---

## Publishing

### Chrome Web Store
1. Create a developer account at [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole) (one-time $5 USD fee)
2. Upload the production ZIP
3. Fill in the listing: description, screenshots (1280×800), 128×128 icon
4. Justify permissions: `storage` (local values profile), `sidePanel` (sidebar UI), `activeTab` (text reading)
5. Submit for review — typically 1–7 business days

### Firefox Add-ons
```bash
pnpm add -D web-ext
npx web-ext build --source-dir build/chrome-mv3-prod
# Upload ZIP at addons.mozilla.org/developers
```

---

## Roadmap

- Obsidian community plugin (same AI core, Obsidian plugin API)
- Optional on-device LLM mode via Ollama + Gemma 3 (full air-gap privacy)
- Onboarding values questionnaire based on Schwartz's PVQ (Portrait Values Questionnaire)
- Export values journal as a weekly PDF reflection report
- Support for more languages via multilingual sentiment models

---

## Licence

opeensource — see `LICENSE` for details.

---

## Disclaimer

Mindscribe is a personal wellness tool, not a medical device or mental health service. It is not a substitute for professional psychological or psychiatric care. If you are experiencing a mental health crisis, please contact a qualified professional or one of the crisis helplines listed above.
