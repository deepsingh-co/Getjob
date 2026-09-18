# GetJob 🚀

GetJob is a full-stack web application designed to help users prepare for job interviews, manage resume/AI mock interviews, and streamline their career advancement process using modern web technologies and AI integrations.

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
│   ├── controllers/     # Request handler logic (Auth, User)
│   ├── middleware/      # Authentication & authorization middleware
│   ├── models/          # Mongoose schemas (User, etc.)
│   ├── routes/          # Express route definitions
│   ├── index.js         # Entry point for Express server
│   └── package.json     # Backend dependencies & scripts
└── frontend/
    ├── public/          # Static assets & images
    ├── src/
    │   ├── assets/      # Videos, icons, and image resources
    │   ├── components/  # Reusable UI components (Navbar, etc.)
    │   ├── pages/       # Application pages (Home, Auth)
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
```

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
