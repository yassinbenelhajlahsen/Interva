# Interva

AI-powered interview tracking app. Manage job applications, track interview rounds, and generate AI-based questions per round.

**Stack:** React + Vite · NestJS · PostgreSQL · Prisma · Firebase Auth · OpenAI

---

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string)
- Firebase project with **Email/Password** and **Google** sign-in enabled
- OpenAI API key

### 1. Clone & install

```bash
git clone <repo-url>
cd Interva
npm install
```

### 2. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

**Backend** (`backend/.env` or root `.env`):

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `FIREBASE_PROJECT_ID` | Firebase Console → Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Firebase Console → Service Accounts → Generate new private key |
| `FIREBASE_PRIVATE_KEY` | Same JSON file — paste the `private_key` value |
| `OPENAI_API_KEY` | platform.openai.com → API keys |

**Frontend** (`frontend/.env`):

| Variable | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your apps → Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same location |
| `VITE_FIREBASE_PROJECT_ID` | Same location |

### 3. Set up the database

```bash
npm run db:migrate
```

### 4. Run

```bash
npm run dev
```

Opens:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## Firebase setup checklist

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**
3. **Project Settings → Service Accounts**: generate a new private key and paste the values into your `.env`
4. **Project Settings → Your apps**: add a Web app and copy the config into `frontend/.env`

---

## API Reference

### Applications
| Method | Path | Description |
|---|---|---|
| GET | `/applications` | List all applications |
| GET | `/applications/:id` | Get single application |
| POST | `/applications` | Create application |
| PATCH | `/applications/:id` | Update application |
| DELETE | `/applications/:id` | Delete application |

### Interview Rounds
| Method | Path | Description |
|---|---|---|
| GET | `/applications/:id/rounds` | List rounds for an application |
| GET | `/rounds/:id` | Get single round (includes questions) |
| POST | `/applications/:id/rounds` | Create round |
| PATCH | `/rounds/:id` | Update round |
| DELETE | `/rounds/:id` | Delete round |

### AI
| Method | Path | Description |
|---|---|---|
| POST | `/rounds/:id/generate-questions` | Generate 5 interview questions via OpenAI |

All routes require `Authorization: Bearer <Firebase ID Token>`.

---

## Data model

```
User
 └── Application (company, role, status, jobDescription)
      └── InterviewRound (roundType, date, notes, outcome)
           └── GeneratedQuestion (questionText)
```
