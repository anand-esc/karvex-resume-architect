# KARVEX — Editorial Resume Architect

> **AI-Powered Career Intelligence · Resume + 2-Page CV Generation · Firebase Auth**

KARVEX is a full-stack AI-powered resume and CV generation platform. Users fill out a single *Master Profile* once, provide a Job Description, and KARVEX uses Google Gemini to generate a tailor-made, ATS-optimized PDF resume or 2-page CV in seconds — formatted with one of 10 premium layout templates.

---

## 📐 Architecture Overview

```
karvex-resume-architect/
├── public/                  Static assets (icon.svg, robots.txt)
├── src/
│   ├── components/
│   │   ├── landing/         Premium landing page sections (9 components)
│   │   │   ├── HeroGeometric.jsx
│   │   │   ├── HowItWorksSection.jsx
│   │   │   ├── FeaturesSection.jsx
│   │   │   ├── AudienceSection.jsx
│   │   │   ├── TestimonialsSection.jsx
│   │   │   ├── PricingSection.jsx
│   │   │   ├── FAQSection.jsx
│   │   │   ├── CTASection.jsx
│   │   │   └── Footer.jsx
│   │   ├── JobModal.jsx     Job description input modal
│   │   └── ProfilePhotoUpload.jsx
│   ├── pages/
│   │   ├── Landing.jsx      Public marketing page (/)
│   │   ├── Login.jsx        Auth page (/login)
│   │   ├── Onboarding.jsx   New user profile wizard (/onboarding)
│   │   ├── Home.jsx         Dashboard — template library (/home, auth required)
│   │   └── Profile.jsx      Master profile editor (/profile, auth required)
│   ├── utils/
│   │   ├── cvGenerator.js   Core PDF engine (jsPDF + AI + 10 templates)
│   │   └── cropImage.js     Photo crop utility
│   ├── firebase.js          Firebase init (Auth, Firestore, Storage)
│   ├── App.jsx              Router with React.lazy code splitting
│   ├── App.css              Minimal global overrides
│   ├── index.css            Tailwind base + Google Fonts + keyframes
│   └── main.jsx             Entry point
├── tailwind.config.js       Brand colors (olive green) + dark theme
├── vite.config.js           Vite + PWA plugin
└── .env                     Secret keys (not committed)
```

---

## 🗺️ Routing

| Path | Component | Auth |
|------|-----------|------|
| `/` | `Landing.jsx` | Public — redirects to `/home` if logged in |
| `/login` | `Login.jsx` | Public |
| `/onboarding` | `Onboarding.jsx` | Authenticated |
| `/home` | `Home.jsx` | Authenticated — redirects to `/login` if not |
| `/profile` | `Profile.jsx` | Authenticated |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Firebase project with **Auth**, **Firestore**, and **Storage** enabled
- A Google Gemini API key

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Firebase config is hardcoded in `src/firebase.js` — update it with your project credentials.

### 3. Run locally
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
```

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 (custom olive brand palette) |
| Animations | Framer Motion + NumberFlow |
| Icons | Lucide React |
| Auth | Firebase Authentication (Email/Password, Google, GitHub) |
| Database | Firebase Firestore |
| Storage | Firebase Storage |
| PDF Engine | jsPDF |
| AI Integration | Google Gemini (via `@google/generative-ai`) |
| Monitoring | LangChain |
| PWA | vite-plugin-pwa |

---

## 📄 Template Library

### 1-Page Resumes
| ID | Name | Style |
|----|------|-------|
| 1 | Modern Editorial | Clean left sidebar |
| 2 | Executive Dark | Dark full-width header |
| 3 | Creative Accent | Purple left-border accent |
| 4 | Classic Academic | Centered serif style |
| 5 | Midnight Tech | Dark background, tech aesthetic |
| 6 | Soft Pastel | Rose pastel header |

### 2-Page CVs
| ID | Name | Based on |
|----|------|---------|
| 7 | Modern Editorial CV | Template 1 |
| 8 | Executive Dark CV | Template 2 |
| 9 | Classic Academic CV | Template 4 |
| 10 | Midnight Tech CV | Template 5 |

---

## 🤖 AI Generation Flow

1. **User fills Master Profile** in `/profile` — stored in Firestore
2. **User navigates to `/home`** and selects a template
3. **Job Modal appears** — user pastes Job Description, company name, and role
4. `cvGenerator.js` calls the **Gemini API** to:
   - Generate a tailored professional summary
   - Score and re-order bullet points for ATS alignment
   - Write a target-specific cover letter (optional)
5. The PDF is rendered using **jsPDF** with the selected template layout and downloaded automatically

---

## 🏗️ Performance Optimisations

- **React.lazy + Suspense** — all pages are code-split; initial bundle is only the landing page
- **Sticky headers** with backdrop blur — no layout shifts
- **Framer Motion** `whileInView` animations — only animate when visible
- **Firebase onAuthStateChanged** — reliable auth guard, no flicker
- **PWA** service worker — offline support and fast repeat visits

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GEMINI_API_KEY` | ✅ | Google Gemini API key for AI resume generation |
| `VITE_LANGCHAIN_API_KEY` | Optional | LangChain monitoring |

---

## 📦 License

MIT — build anything you want on top of KARVEX.
