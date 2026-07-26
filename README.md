# SimplLife

**SimplLife** is a premium, full‑stack task‑management web application that lets users organize work by **Groups** (people or categories) and manage tasks, subtasks, templates, priorities, due dates, and more. It features a sleek, modern UI with light and dark themes, undo/redo, AI‑generated subtask splitting, smart search, and a comprehensive activity log.

---

## 🚀 Features
- **Group‑centric workflow** – organise tasks under people or categories.
- **Subtasks, descriptions, templates** – rich task details with one‑click template insertion.
- **Priority flags & due‑date chips** – colour‑coded urgency indicators.
- **Undo / Redo** – 50‑step history with state synchronization.
- **Smart Search** – debounced in‑memory filtering, term highlighting, and filter chips.
- **AI Subtask Split** – magic‑wand icon to generate subtasks via OpenAI (fallback rules).
- **Calendar view** – CSS‑grid month view with priority‑coded tasks.
- **Recycle Bin (Trash)** – soft‑delete, restore, permanent delete, empty‑all, with toast actions.
- **Activity Log** – timeline of user actions with pagination.
- **Export / Import** – JSON data backup and restore.
- **Push notifications & daily digest email** – reminder banner and scheduled email.
- **Keyboard shortcuts modal** – `?` opens a cheatsheet, plus shortcuts for create, undo, redo, navigation, etc.
- **Responsive design** – desktop, tablet, mobile layouts with a floating theme toggle.

---

## 🛠️ Tech Stack
- **Frontend**: React + TypeScript, Vite, Tailwind CSS, React Router, Zustand for state management.
- **Backend**: Node.js + Express, PostgreSQL (fallback in‑memory DB), JWT authentication.
- **AI**: OpenAI `gpt‑4o‑mini` (with rule‑based fallback).
- **Email**: Node‑cron + Nodemailer for daily digest.
- **Build**: Vite, TypeScript, ESLint, Prettier.

---

## 📦 Getting Started
```bash
# Clone the repository (if you haven't already)
git clone https://github.com/HarshaGaduputi/SimplLife.git
cd SimplLife

# Install dependencies
npm install

# Set up environment variables (copy from .env.example)
cp .env.example .env
# Edit .env with your PostgreSQL URL, OpenAI key, email settings, etc.

# Run the development server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📜 Scripts
- `npm run dev` – start Vite dev server.
- `npm run build` – build production bundle.
- `npm run check` – TypeScript type‑check.
- `npm run lint` – run ESLint.
- `npm run start` – start the built server (after `npm run build`).

---

## 🌐 Deployment
The project includes a `vercel.json` configuration for easy deployment on Vite‑compatible platforms (Vercel, Netlify, Render, etc.). Ensure the environment variables are set in the hosting service.

---

## 📄 License
MIT © 2024‑2026 Harsha Gaduputi
