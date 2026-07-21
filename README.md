# 📋 Productivity Dashboard

> A full-stack task management and field service reporting application built with React, Express.js, and Neon (Serverless Postgres).

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

---

## ✨ Features

### 🔐 Authentication & User Management
- Full **JWT-based authentication** with access + refresh token rotation
- **Email verification** with 6-digit code workflow
- **Password reset** via secure token link
- Role-based accounts (Project Manager, Field Technician, etc.)
- Avatar generation via DiceBear API

### ✅ Task Management
- Create, update, and delete tasks with **title, description, category, priority, and due date**
- Mark tasks complete / incomplete with instant UI feedback
- **Recurring tasks** — daily/weekly auto-scheduling on completion
- **Filtering & searching** tasks by category, status, and keyword
- Inline **task comments** thread per task

### 📊 Activity History & Timeline
- **Full activity log** — every task creation, edit, completion, reopening, and deletion is tracked
- **Completion snapshots** — stores task state (priority, description, status) at the moment of completion
- Collapsible **"Show more / Show less"** description toggle for long entries
- Clean timeline UI with action-specific icons and color coding

### 📅 Daily Service Reports (Journal)
- Structured **daily field service log** with fields for:
  - Project name, objectives, work performed
  - Issues encountered and resolution notes
  - Materials used, time spent, lessons learned, next actions
- **PDF export** and printable journal compiler
- Professional report formatting suitable for field teams

### 📈 Productivity Stats
- Visual dashboards: **completion rate**, **tasks by category**, task velocity trends
- **Smart Triage** view to surface high-priority incomplete work
- Daily summary cards

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | Neon (Serverless PostgreSQL) |
| **Auth** | JWT (Access + Refresh Tokens), bcryptjs |
| **Query Layer** | @neondatabase/serverless |
| **Dev Tools** | Nodemon, ESLint |
| **Deployment** | Vercel |

---

## 🗂️ Project Structure

```
express-react-todo/
├── backend/
│   ├── index.js                   # Express app entry point
│   └── src/
│       ├── db.js                  # Neon DB adapter with local fallback
│       ├── models/
│       │   ├── initDb.js          # Schema auto-initialization
│       │   ├── userModel.js       # User auth queries
│       │   ├── todoModel.js       # Task CRUD + history logging
│       │   ├── journalModel.js    # Daily journal CRUD
│       │   └── commentModel.js    # Task comment queries
│       ├── routes/                # Express route definitions
│       ├── controllers/           # Route handler logic
│       └── middleware/
│           ├── authMiddleware.js  # JWT verification
│           └── validate.js        # Request validation
├── frontend/
│   └── src/
│       ├── api/                   # Axios-based API clients
│       ├── components/
│       │   ├── auth/              # Login, Register, Landing page
│       │   ├── history/           # Timeline, Journal views
│       │   ├── productivity/      # Stats and triage
│       │   └── common/            # Shared UI components
│       ├── context/               # AuthContext, TodoContext
│       └── hooks/                 # useAuth, useTodos, useHistory, etc.
└── vercel.json                    # Vercel deployment config
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech/) account (free tier works)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/productivity-dashboard.git
cd productivity-dashboard
```

### 2. Set up the Backend
```bash
cd backend
npm install
```

Create a `.env` file from `.env.example`:
```env
DATABASE_URL=postgresql://your_neon_connection_string
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=5000
```

Start the dev server:
```bash
npm run dev
```

> ✅ Database tables are **auto-initialized** on first startup — no manual migrations needed!

### 3. Set up the Frontend
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🌐 Deployment

This project is configured for **Vercel** deployment out of the box.

```bash
npm i -g vercel
vercel
```

Add your environment variables under **Vercel Dashboard → Settings → Environment Variables**.

---

## 🔒 Security Highlights
- Passwords hashed with **bcrypt** (10 salt rounds)
- **Short-lived access tokens** (15 min) + **long-lived refresh tokens** (7 days)
- Token rotation on every refresh — old tokens are invalidated immediately
- Email verification required before first login
- SQL injection protected via **parameterized queries** throughout

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

Built as a full-stack portfolio project demonstrating:
- RESTful API design with Express.js
- Serverless PostgreSQL integration via Neon
- JWT authentication with refresh token rotation
- React context + custom hooks architecture
- Clean, modular component structure
