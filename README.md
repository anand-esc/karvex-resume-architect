<div align="center">
  <h1 align="center">KARVEX</h1>
  <p align="center">
    <strong>Editorial Resume Core • AI-Powered Career Intelligence</strong>
  </p>
</div>

KARVEX is a premium, React-based web application designed to bridge the gap between candidate raw data and the specific requirements of their target roles. It utilizes an advanced AI text-processing engine (Google Gemini) and client-side PDF generation to create perfectly tailored, ATS-optimized, beautifully architected resumes on the fly. 

Stop sending generic resumes. Architect your professional narrative with KARVEX.

## ⚡ Quick Start

To quickly start the development server and run KARVEX locally:
```bash
git clone <your-repo>
cd karvex
npm install
npm run dev
```
*(Runs on `http://localhost:5173` by default. See full setup instructions below for API Keys)*

## 🌟 Key Features

- **Secure Authentication:** Integrated Email/Password, Google, and GitHub login flows powered by Firebase Auth.
- **The Master Profile:** Users establish their baseline (Skills, Experience, Projects, Contact Info) during onboarding, securely stored in Firestore.
- **Targeted AI Rewriting:** Users input their target Job Description (JD). The system uses **Gemini 2.5 Flash** to extract keywords, rank skills, write a custom 3-sentence summary, and rewrite the candidate's existing experience/project bullet points to mirror the JD's phrasing.
- **6 Premium Architectures (Templates):**
  - **Modern Editorial (Blue):** Clean, classic, readable column layout.
  - **Executive Dark:** High-contrast header geared towards tech roles.
  - **Creative Accent:** Bold stripe for modern startups and design roles.
  - **Classic Academic:** Traditional Times New Roman format, highly ATS-readable for finance/law.
  - **Midnight Tech:** Full dark mode with neon emerald hacker aesthetics.
  - **Soft Pastel:** Elegant, spacious, warm aesthetic.
- **Instant Client-Side PDF Engine:** Layouts are drawn instantly in the browser using `jsPDF`, meaning no backend rendering latency.

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite
- **Styling:** Tailwind CSS, PostCSS, Framer Motion/Custom CSS Animations
- **Backend/BaaS:** Firebase (Authentication, Firestore, Storage)
- **AI Core:** Google Generative AI (`@google/generative-ai`)
- **PDF Generation:** `jspdf`
- **Routing & State:** `react-router-dom`, React Hooks
- **UI UX Utilities:** `react-hot-toast` (notifications), `react-easy-crop`, `@dnd-kit/core`

---

## 🚀 How to Use (For Users)

1. **Sign In:** Navigate to the main page and authenticate using your preferred method (Email, Google, or GitHub).
2. **Build Master Profile (Onboarding):** Upon your first login, you will be prompted to input your vital information: Full Name, Headline, Skills, Summary, and upload a professional photo.
3. **The Dashboard:** Once onboarding is complete, you will land on the Home dashboard showing the 3-Step Process.
4. **Choose Architecture:** Browse the available Resume Templates at the bottom of the dashboard and select the one that fits your target industry.
5. **Target the Role:** A modal will appear. Input the **Company Name**, **Target Role title**, and paste the **Job Description**.
6. **Generate & Win:** KARVEX will process your Master Profile against the Job Description. The button will indicate progress, and within seconds, your highly tailored, customized PDF will download automatically.

---

## 💻 Local Setup & Installation

Follow these steps to get your own instance of KARVEX running locally.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- A [Firebase Project](https://console.firebase.google.com/) (Auth, Firestore, Cloud Storage enabled)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone & Install Dependencies
```bash
# Clone the repository (if applicable)
# git clone <repo-url>
cd karvex

# Install all required packages
npm install
```

### 2. Configure Firebase Environment
You will need to overwrite the `src/firebase.js` configuration with your own project's keys if you wish to host your own database instance. 
Ensure **Authentication** (Email/Password, Google, GitHub), **Firestore Database**, and **Storage** rules are enabled in your Firebase console.

### 3. Add Environment Variables
Create a `.env` file in the root of the project to hold your Google Generative AI key. This allows Vite to securely inject it:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```

Your app should now be running locally at `http://localhost:5173`.

---

## 🛠 How to Edit and Contribute (Developer Guide)

KARVEX is built to be highly extensible. Below are the key areas you might want to edit or contribute to.

### Project Architecture Overview
- `src/pages/`: Contains main route views (`Login.jsx`, `Onboarding.jsx`, `Home.jsx`, `Profile.jsx`).
- `src/components/`: Reusable UI components (Modals, Photo Uploaders).
- `src/utils/cvGenerator.js`: **The Core AI & PDF Engine.** This file houses the Gemini prompting logic and the `jsPDF` render trees.
- `src/firebase.js`: Initializes your backend connections.

### 1. Modifying the AI Logic (The Brain)
To change how the resume summary or bullet points are formulated, navigate to `src/utils/cvGenerator.js`.
Inside `generateSuperCV()`, find the `prompt` string. You can modify the system instructions provided to `gemini-2.5-flash` to make the output more aggressive, concise, or formatted differently.
*Note: Ensure the prompt strictly instructs the AI to return the specific JSON signature expected by the parser.*

### 2. Adding a New Resume Template (Architecture)
To add a new visual template to the downloader:
1. **Create the PDF Render Logic:** Open `src/utils/cvGenerator.js`. Create a new rendering function (e.g., `const renderNewDesign = () => { ... }`). Use `jsPDF` commands (`doc.setFont`, `doc.text`, `doc.rect`) to draw your layout, hooking up the user data variables (e.g., `personalInfo`, `finalExperience`).
2. **Register the Render Function:** Scroll to the bottom of `generateSuperCV()` and add your new ID to the `if/else` block:
   ```javascript
   else if (templateId === 7) renderNewDesign();
   ```
3. **Add Template to Dashboard UI:** Open `src/pages/Home.jsx`. 
   - Build a mini-wireframe component for the visual preview (e.g., `const WireframeNewDesign = () => (...)`).
   - Add your new template to the `templates` array:
   ```javascript
   { id: 7, name: "New Design Name", bg: "bg-blue-100/50", icon: <WireframeNewDesign />, desc: "Description of your new layout." }
   ```

### 3. Modifying the Database Schema
The primary user data is stored in a Firestore document under `users/{uid}`.
If you add new form fields to `Onboarding.jsx` or `Profile.jsx` (for example, "Hobbies" or "Languages"):
1. Update the state structure in the component.
2. Update the `setDoc`/`updateDoc` object to include your new fields.
3. Update `src/utils/cvGenerator.js` to destruct those new variables from the `userProfile` argument and render them within your templates.

## License
MIT License. Feel free to use, edit, and contribute to the core.
