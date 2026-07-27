# HSC 2026 Biology 2nd Paper MCQ Exam Simulator 🌸

A premium, aesthetic "girly" themed, and fully responsive online MCQ examination web application designed specifically for **HSC 2026 Batch Bangladesh students**.

Featuring **500 original, high-quality, hard, tricky, and trap Zoology questions** covering all 12 chapters of the HSC Biology 2nd Paper syllabus.

---

## Features 🚀

- **Girly & Premium Design (Sakura theme)**: Built using soft pastel pinks, lavenders, rose-gold accents, custom floating animations, and modern typography (Outfit & Inter fonts).
- **Google Form-Like Exam Engine**: Question Navigator, color-coded status rings, and simple selection cards (no tiny radio buttons!).
- **Progress Persistence**: Uses `localStorage` to save all state (current question, answers, marked questions, timer, configuration). Reloading or accidentally closing the tab won't wipe progress; students can resume from where they left off.
- **Multiple Exam Modes**:
  - **Full Exam**: 500 Questions with a 500-minute timer.
  - **Practice Exam**: Choose 25, 50, 100, 200, or 500 questions.
  - **Random Exam**: Randomly draws questions from the 500-question bank.
  - **Chapter-wise**: Test specific Zoology chapters.
  - **Custom Exam**: Choose chapters, question count, timer, and shuffle parameters.
- **Optional Timer**: Configurable exam countdown timer that auto-submits when it hits zero.
- **Before-Unload Warnings**: Prevents students from losing active exam state by accident.
- **Interactive Results Page**: Performance-based badges, score percentages, and detailed stats (correct, wrong, unanswered).
- **Comprehensive Answer Review**: Shows correct/incorrect choices, checks/crosses, and detailed scientific explanations for every question.
  - Includes a **Retry Wrong Questions** mode, which creates a new exam session containing only the questions missed!

---

## Tech Stack 🛠️

- **Core**: React 19 + Vite 8 + JavaScript (ESM)
- **Styling**: Tailwind CSS v4 + PostCSS 8 + Autoprefixer 10
- **Icons**: Lucide React

---

## Local Setup & Commands 💻

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Install Dependencies
Installs React, Vite, Tailwind CSS v4, Lucide Icons, and PostCSS plugins:
```bash
npm install
```

### 2. Run the Development Server
Launches the local Vite server with Hot Module Replacement (HMR):
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
Compiles and minifies the assets into the `dist/` directory, ready for deployment:
```bash
npm run build
```

### 4. Preview the Build
Runs a local server to test the compiled production build:
```bash
npm run preview
```

---

## How to Deploy to Vercel 🚀

This project is fully configured and ready for production deployment on Vercel.

### Method 1: Deploying via Vercel CLI (Fastest)

1. Open your terminal in the project root.
2. Install the Vercel CLI globally (if you haven't already):
   ```bash
   npm install -g vercel
   ```
3. Run the deployment command:
   ```bash
   vercel
   ```
4. Follow the command prompts:
   - Log in or sign up.
   - Set up and deploy the project: **Yes**.
   - Select your scope/account.
   - Link to an existing project: **No** (it's a new project).
   - Project Name: `hsc-2026-bio-exam` (or custom name).
   - Directory: `./`.
   - Vercel will auto-detect **Vite** and configure the settings automatically (Build Command: `npm run build`, Output Directory: `dist`). Select **Yes** to default settings.
5. Once the build finishes, you will receive your live production URL (e.g., `https://hsc-2026-bio-exam.vercel.app`).
6. To deploy to production later:
   ```bash
   vercel --prod
   ```

### Method 2: Deploying via GitHub Integration (Recommended for CI/CD)

1. Create a new repository on GitHub (or GitLab/Bitbucket).
2. Initialize git locally, commit files, and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HSC 2026 Biology Exam App"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
3. Go to [Vercel Dashboard](https://vercel.com) and log in.
4. Click **Add New** -> **Project**.
5. Import your GitHub repository.
6. Under **Framework Preset**, Vercel will automatically detect **Vite**.
7. Click **Deploy**.
8. Vercel will rebuild the project and deploy it. Any subsequent pushes to your `main` branch will automatically trigger a new production build!
