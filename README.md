# Online Exam System

Full-stack web app for teachers to manage quiz questions and for students to take timed exams, with results, analytics, and optional result email (PDF).

**Repository:** [github.com/Thaksigan23/online-exam-system](https://github.com/Thaksigan23/online-exam-system)

## Stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React (CRA), React Router, Axios      |
| Backend  | Node.js, Express, JWT, Mongoose       |
| Database | MongoDB (Atlas or local)              |
| Email    | Nodemailer (Gmail / SMTP)             |

## Features

- **Roles:** Student and teacher accounts (JWT auth).
- **Quiz:** Per-exam timer with auto-submit; **one attempt** per student per active exam.
- **Randomization:** Questions and options are shuffled per student (deterministic seed).
- **Results:** Per-question breakdown (selected vs correct); student history; teacher list + filters.
- **Analytics:** Teacher dashboard with attempt counts, average score, pass rate, and per-question accuracy.

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- A MongoDB database ([MongoDB Atlas](https://www.mongodb.com/atlas) is fine)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/Thaksigan23/online-exam-system.git
cd online-exam-system

cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend environment

Create `backend/.env` (this file is **gitignored** — never commit secrets):

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_long_random_secret
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your_app_password
SMTP_PORT=587
```

- Use a real Atlas URI; replace `USER`, `PASSWORD`, `CLUSTER`, and `DATABASE` as needed.
- If the password contains special characters, URL-encode them in `MONGO_URI`.
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) and quote `EMAIL_PASS` in `.env` if it contains spaces.

### 3. Run locally

**Terminal 1 — API (default port 5000)**

```bash
cd backend
npm start
```

**Terminal 2 — React app**

```bash
cd frontend
npm start
```

The UI calls the API at `http://localhost:5000` in several places; keep the backend on that port or update the frontend URLs consistently.

## Usage overview

1. **Register** as teacher or student (`/register`).
2. **Teacher:** Add questions via `/questions` (POST `/api/questions`). The active exam uses the global question bank plus any questions tied to the current exam.
3. **Student:** Take the exam from **Take Exam** (`/exam`) — timer, single submit, then view results (`/results` or `/student/results`).
4. **Teacher:** View all attempts and analytics from **Teacher Dashboard** (`/teacher/dashboard`) and filtered results (`/teacher-results`).

## API highlights (prefix `/api`)

| Area        | Examples |
| ----------- | -------- |
| Auth        | `POST /auth/register`, `POST /auth/login` |
| Questions   | `GET/POST /questions` (teacher for writes) |
| Exam        | `GET /exam/questions`, `POST /exam/submit` (student) |
| Results     | `GET /results/my`, `GET /results`, `GET /results/analytics` (teacher for last two) |

## Build frontend for production

```bash
cd frontend
npm run build
```

Serve the `frontend/build` folder with any static host; configure API base URL for your deployment if it is not `localhost:5000`.

## License

ISC (backend `package.json`). Adjust if you prefer another license.
