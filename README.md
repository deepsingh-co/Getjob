# Interview.Hai — GetJob

AI-assisted hiring platform: candidates build a profile and practise with AI, companies post roles, the system scores every profile against the role, texts the shortlist to HR, and — on confirmation — calls the candidate to lock the interview slot.

Monorepo: **MERN** (MongoDB, Express, React 19, Node) + Firebase Google login + Twilio SMS/voice.

---

## 1. What the product does

| Role | What they see |
|------|---------------|
| **Candidate** (customer) | `/dashboard` — interview pipeline, open jobs with match %, profile, credits |
| **Company / founder** | `/company` — work uploads, post a job, matched candidates with Confirm/Reject |
| **Guest** | Landing page: hero, live stats, work showcase, how-it-works, testimonials |

### Hiring flow (the core loop)

```
Company posts a job  (POST /api/jobs)
        │
        ▼
Matching engine scores every open profile
(skills 60% · experience 25% · education 10% · location 5%)
        │
        ▼
Interview documents created (status: matched)
        │
        ├──────────────► Twilio SMS to HR  (shortlist + job code)
        │
        └──────────────► Twilio VOICE CALL to HR (automated IVR)
                              1  confirm the shortlist  → hr_confirmed + candidate calls
                              2  human review           → human_review
                              3  cancel                 → rejected
                              4  follow up              → follow_up
        │
        ▼  (after HR confirms — by IVR key, dashboard button, or SMS "YES <code>")
Automated Twilio voice call to each candidate
        1  confirm            → candidate_accepted log (stays candidate_called)
        2  cannot confirm     → rejected
        3  delay the interview→ delayed
        4  consider for next job → next_job
        │
        ▼
candidate dashboard updates live
```

Dry-run mode: if `TWILIO_*` keys are empty, SMS/calls are logged to the backend console instead of being sent.

#### Twilio configuration

`backend/.env` (git-ignored):

```env
TWILIO_ACCOUNT_SID = "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN  = "your-auth-token"
TWILIO_PHONE_NUMBER = "+1XXXXXXXXXX"   # Twilio voice-capable number
SERVER_URL = "https://your-public-host" # must be public for DTMF callbacks
```

- Without these keys everything still works in **dry-run** (logged, not sent).
- The HR/candidate **calls themselves** only need valid credentials (TwiML is sent inline with the API call).
- The **keypad (DTMF) callbacks** need a publicly reachable `SERVER_URL` (use ngrok while developing locally: `ngrok http 8000` and put that URL in `SERVER_URL`), otherwise Twilio cannot POST the digits back.
- Webhooks are signature-verified (`X-Twilio-Signature`) — requests without a valid signature get `403`.
- Smoke test the integration: `cd backend && npm run test:ivr` (creates a temp job, exercises both IVR handlers with signed requests, then cleans up).

---

## 2. Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19 + Vite 8, Tailwind CSS 4, React Router 7, Redux Toolkit, motion (framer), react-icons, axios |
| Auth | Firebase Google sign-in → backend JWT in an httpOnly cookie (7 days) |
| Backend | Node 22, Express 5, Mongoose 9, cookie-parser, multer, Twilio SDK |
| Database | MongoDB (local `mongodb://127.0.0.1:27017/getjob` or Atlas) |
| Lint | oxlint (`npm run lint`) |

---

## 3. Repo structure

```
Getjob/
├── backend/
│   ├── index.js               # express app, CORS, router mounting, /uploads static
│   ├── seed.js                # demo dataset  (npm run seed)
│   ├── .env                   # secrets (git-ignored)
│   ├── config/                # connectDB, token
│   ├── middleware/isAuth.js   # JWT cookie guard → req.userId
│   ├── models/                # user, profile, job, interview, work, contact
│   ├── controllers/           # auth, user, job, hiring, work, stats, contact
│   ├── routes/                # one router per resource
│   ├── services/
│   │   ├── matching.service.js   # scoring algorithm
│   │   ├── hiring.service.js     # match → SMS → confirm → call
│   │   └── twilio.service.js     # SMS/call/TwiML + signature validation
│   └── uploads/               # work cover images (served at /uploads)
│
└── frontend/
    └── src/
        ├── App.jsx            # routes + ServerUrl export
        ├── pages/             # Home, Auth, Dashboard, CompanyDashboard,
        │                      # PostJob, CandidateProfile, About, Contact, Privacy
        ├── components/
        │   ├── Navbar.jsx     # role-aware links
        │   └── landing/       # Hero, Marquee, Features, FeaturedWork,
        │                      # HowItWorks, Stats, Testimonials, CtaFooter
        ├── redux/userSlice.js # userData in store
        └── utils/firebase.js  # Firebase config
```

### Routes (frontend)

| Path | Page | Access |
|------|------|--------|
| `/` | Landing, or redirects to the right dashboard when logged in | public |
| `/auth` | Candidate Google login → `/dashboard` | guest |
| `/auth?role=company` | Company Google login → `/company` | guest |
| `/dashboard` | Candidate dashboard | candidate |
| `/company` | Company / founder dashboard | company |
| `/post-job` | Post a job + live matches | company |
| `/profile` | Candidate profile form | candidate |
| `/about`, `/contact`, `/privacy` | Static pages (navbar only when logged out) | public |

---

## 4. Getting started

### Prerequisites
- Node 18+ (tested on Node 22)
- MongoDB running locally **or** an Atlas connection string
- A Firebase project with **Google** sign-in enabled and `localhost` in Authorised domains

### Install

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### Environment — `backend/.env`

```env
PORT = 8000
MONGODB_URL = "mongodb://127.0.0.1:27017/getjob"
JWT_SECRET = "change-me"
SERVER_URL = "http://localhost:8000"   # public URL (ngrok) once you want DTMF callbacks

# Twilio — leave empty for dry-run mode (SMS/calls logged, not sent)
TWILIO_ACCOUNT_SID = ""
TWILIO_AUTH_TOKEN = ""
TWILIO_PHONE_NUMBER = ""
```

Firebase config lives in `frontend/src/utils/firebase.js` (or `frontend/.env` with `VITE_FIREBASE_*`).

### Seed the demo dataset

```bash
cd backend
npm run seed
```

Creates:

- **2 companies** — Nexlify Labs + Orbit Fintech (the first one binds to an existing company login if present)
- **6 candidates** with profiles (skills, experience, phone, location)
- **4 active jobs** — Frontend, Backend, AI/ML, Product Design (with future interview slots)
- **9 interviews** across statuses: `matched`, `hr_notified`, `hr_confirmed`, `candidate_called`
- **4 published works** with cover images (rendered in the landing "Work showcase")
- Existing accounts that log in get a demo profile + interview automatically
- Removes throwaway test accounts (`*@example.com`, `*@e.com`)

Bind seed data to your own Google account:

```bash
npm run seed -- --company-email=you@gmail.com --candidate-email=you@gmail.com
# or: SEED_COMPANY_EMAIL=... SEED_CANDIDATE_EMAIL=... npm run seed
```

Seed is idempotent — run it as often as you like.

### Run (3 terminals)

```bash
# terminal 1 — MongoDB (skip if already running as a service)
mongod

# terminal 2 — API on :8000
cd backend && npm run dev        # or: node index.js

# terminal 3 — web app on :5173
cd frontend && npm run dev
```

Open http://localhost:5173

---

## 5. API reference

`Cookie: token=<JWT>` required where marked 🔒. Use `withCredentials: true`.

### Auth
| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| POST | `/api/auth/google` | `{name, email}` | Firebase-verified client → sets cookie |
| POST | `/api/auth/logout` | — | clears cookie |

### User 🔒
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/user/current-user` | current user |
| GET | `/api/user/profile` | candidate profile (404 if none) |
| POST | `/api/user/profile` | create/update profile |
| POST | `/api/user/company-profile` | `{companyName, website, about}` |

### Jobs 🔒
| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/jobs` | create job → runs matching → texts HR |
| GET | `/api/jobs` | jobs posted by you (company) |
| GET | `/api/jobs/open` | **all active jobs with your match % + application status** (candidate) |
| GET | `/api/jobs/matches` | every open profile (for `/post-job`) |
| GET | `/api/jobs/:id/matches` | `{job, matches}` for one job |

### Hiring 🔒
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/hiring/my-interviews` | candidate's pipeline |
| GET | `/api/hiring/candidates` | **all candidates matched to your jobs (company)** |
| POST | `/api/hiring/interviews/:id/confirm` | confirm → places the candidate call |
| POST | `/api/hiring/interviews/:id/reject` | mark not selected |

### Twilio webhooks (public, signature-verified)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/hiring/twilio/inbound-sms` | HR replies `YES <code>` / `NO <code>` |
| `POST /api/hiring/twilio/hr-gather` | **HR IVR**: 1 confirm · 2 human review · 3 cancel · 4 follow up |
| `POST /api/hiring/twilio/candidate-gather` | **Candidate IVR**: 1 confirm · 2 not confirmed · 3 delay · 4 next job |
| `POST /api/hiring/twilio/call-status` | call status callback |

### Public
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/stats` | `{candidates, jobs, matches, confirmed}` for landing |
| GET | `/api/works` | published works (landing showcase) |
| POST | `/api/contact` | `{name, email, message}` |

### Works 🔒
`GET /mine` · `POST /` (multipart, field `image`) · `PUT /:id` · `DELETE /:id`

---

## 6. Data models

| Model | Key fields |
|-------|-----------|
| **User** | `name, email (unique), role: candidate\|company, credits, companyName, website, about` |
| **Profile** | `user (unique), phone, headline, skills[], experienceYears, education, location, summary, openToWork` |
| **Job** | `title, company, skills[], experienceYears, education, location, jobType, interviewDateTime, refCode (unique), hrName, hrPhone, postedBy, status, matchThreshold` |
| **Interview** | `job + candidate (unique pair), matchScore, matchedSkills[], missingSkills[], status, hrSmsSid, callSid, logs[]` |
| **Work** | `title, description, category, link, tags[], image, companyName, uploadedBy, status` |
| **Contact** | `name, email, message` |

Interview status machine:

```
matched → hr_notified → hr_confirmed → candidate_called
   │           │              │
   │           ├─ human_review (HR key 2)   ├─ delayed    (candidate key 3)
   │           ├─ follow_up   (HR key 4)    ├─ next_job   (candidate key 4)
   │           └─ rejected    (HR key 3)    └─ rejected   (candidate key 2)
   └─ rejected / failed
```

Matching weights (`backend/services/matching.service.js`): skills **60**, experience **25**, education **10**, location **5** → 0-100 score; jobs only match profiles scoring ≥ `matchThreshold` (default 50).

---

## 7. Frontend behaviour notes

- **Navbar is role-aware**: guests see Home/About/Contact/Privacy; candidates see Home/Dashboard; companies see Home/Company Dashboard. After login the informational links disappear.
- **Candidate dashboard** shows your interview pipeline **and all open jobs with your match %**.
- **Company dashboard** shows uploads **and matched candidates** with inline Confirm/Reject.
- **Home (`/`)** renders the right dashboard directly for a logged-in user — no wrong-dashboard links anywhere.
- **"Watch how it works"** scrolls to the How-it-works section.
- Landing stats come from `/api/stats`, work showcase from `/api/works` — no hardcoded numbers.

---

## 8. Verification / quality gates

```bash
cd frontend && npm run lint        # oxlint → must be 0 warnings 0 errors
cd frontend && npm run build       # vite production build
cd backend  && node --check index.js && node --check seed.js
```

Smoke test the API:

```bash
curl http://localhost:8000/api/stats
curl http://localhost:8000/api/works
curl -X POST http://localhost:8000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Dev","email":"dev@test.com","message":"Hi"}'
```

---

## 9. Deployment notes

- **Backend** (Render/Railway/VM): set `MONGODB_URL` (Atlas), `JWT_SECRET`, `SERVER_URL`, `TWILIO_*`; point Twilio SMS webhook to `https://<host>/api/hiring/twilio/inbound-sms` and voice status callbacks to the two Twilio endpoints.
- **Frontend** (Vercel/Netlify): change `ServerUrl` in `frontend/src/App.jsx` to the deployed API origin and update the CORS `origin` in `backend/index.js` accordingly; set `cookie` `secure: true` and `sameSite: "none"` behind HTTPS.
- **Firebase**: add the production domain to Authentication → Settings → Authorised domains.
- Run `npm run seed` once in staging/demo environments to populate data; never in a production DB with real users.

### Troubleshooting

| Symptom | Fix |
|---------|-----|
| `db already exists with different case` | lowercase DB name in `MONGODB_URL` |
| Atlas host `does not resolve` | use a local `mongod` or a valid Atlas SRV |
| Login redirects nowhere | check Firebase authorised domains + `VITE_FIREBASE_*` |
| No SMS/call | empty `TWILIO_*` = dry-run; check backend console logs |
| Port busy | kill the old PID (`Get-NetTCPConnection -LocalPort 8000`) and restart |
