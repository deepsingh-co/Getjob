# GetJob 🚀

GetJob is a full-stack web application designed to help users prepare for job interviews, manage resume/AI mock interviews, and streamline their career advancement process using modern web technologies and AI integrations.

## 🤖 Hiring Automation (Twilio)

1. A company **posts a job** (`POST /api/jobs` or the `/post-job` page).
2. The system **matches candidate profiles** against the job (skills 60%, experience 25%, education 10%, location 5%) and stores every candidate scoring above the threshold.
3. The company **HR receives a Twilio SMS** listing the shortlisted candidates with their match score, plus a reply code (`YES <refCode>` / `NO <refCode>`).
4. When the **HR replies "YES"**, the system places an **automated Twilio voice call** (TwiML text-to-speech) to each selected candidate confirming the interview date/time. The candidate can press `1` to confirm or `2` to reschedule.
5. Every step (matched → hr_notified → hr_confirmed → candidate_called) is tracked in the interview pipeline.

### Endpoints
| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/user/profile` | Save candidate profile (phone, skills, experience) |
| POST | `/api/jobs` | Post job → match profiles → SMS the HR |
| GET | `/api/jobs/:id/matches` | View matched candidates & status |
| POST | `/api/hiring/interviews/:id/confirm` | Confirm → automated call to candidate |
| POST | `/api/hiring/interviews/:id/reject` | Reject candidate |
| POST | `/api/hiring/twilio/inbound-sms` | Twilio webhook for HR reply |
| POST | `/api/hiring/twilio/candidate-gather` | Twilio webhook for candidate DTMF |
| POST | `/api/hiring/twilio/call-status` | Twilio voice status callback |

Point your Twilio phone number's **Messaging webhook** to `SERVER_URL/api/hiring/twilio/inbound-sms` (HTTP POST) to enable HR replies.

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **State Management**: Redux Toolkit & React Redux
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Authentication/Services**: Firebase
- **Animations/UI**: Motion, React Icons

### Backend (`/backend`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JSON Web Tokens (JWT), Cookie-Parser
- **Middleware**: CORS, Dotenv
- **Development**: Nodemon

---

## 📁 Project Structure

```text
Getjob/
├── backend/
│   ├── config/          # Database connection & token utilities
│   ├── controllers/     # Request handler logic (Auth, User, Job, Hiring)
│   ├── middleware/      # Authentication & authorization middleware
│   ├── models/          # Mongoose schemas (User, Profile, Job, Interview)
│   ├── routes/          # Express route definitions
│   ├── services/        # Profile matching + Twilio SMS/voice services
│   ├── index.js         # Entry point for Express server
│   └── package.json     # Backend dependencies & scripts
└── frontend/
    ├── public/          # Static assets & images
    ├── src/
    │   ├── assets/      # Videos, icons, and image resources
    │   ├── components/  # Reusable UI components (Navbar, etc.)
    │   ├── pages/       # Application pages (Home, Auth, PostJob, CandidateProfile)
    │   ├── redux/       # Redux store and user slice
    │   ├── utils/       # Firebase & helper utilities
    │   ├── App.jsx      # Main application component & routes
    │   ├── main.jsx     # React entry point
    │   └── index.css    # Global Tailwind styles
    ├── package.json     # Frontend dependencies & scripts
    └── vite.config.js   # Vite configuration
```

---

## ⚙️ Getting Started & Installation

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or MongoDB Atlas)

### 1. Clone the repository & navigate to project root
```bash
git clone <repository-url>
cd Getjob
```

### 2. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
SERVER_URL=http://localhost:8000

# Twilio (SMS to HR + automated interview calls)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```
> If the Twilio keys are empty, the system runs in **dry-run mode**: SMS/call content is printed to the server log instead of being sent.

Run the backend development server:
```bash
npm run dev
```
*(Server will start on http://localhost:8000)*

### 3. Setup Frontend
Open a new terminal window/tab:
```bash
cd frontend
npm install
```
Create a `.env` file in the `frontend` directory if needed for configuration (e.g. Firebase credentials).

Run the frontend development server:
```bash
npm run dev
```
*(Vite dev server will start on http://localhost:5173)*

---

## 📜 Available Scripts

### Backend (`/backend`)
- `npm run dev`: Starts the backend server with `nodemon` for auto-reloading.

### Frontend (`/frontend`)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Runs `oxlint` code linting.
- `npm run preview`: Previews the production build locally.
