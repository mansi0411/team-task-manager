# Team Task Manager

Full-stack team task management application with role-based access control.

## Tech stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS

## Project structure

```
task-manager/
├── backend/          # REST API
└── frontend/         # React UI
```

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB Atlas URI and JWT_SECRET
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL to your backend URL (default http://localhost:5001)
npm run dev
```

## Environment variables

See `backend/.env.example` and `frontend/.env.example`.
