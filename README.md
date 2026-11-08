# SkillSwap: Student Skill Exchange Platform

A MERN stack web app where university students trade skills instead of paying for lessons. Students list what they can teach and what they want to learn. The app finds mutual matches, and students can send requests, message each other, and leave reviews after a completed session.

**Group:** Hiba Nadeem (23L-2585), Maryam Tariq (23L-2578), BSDS-7A
**Course:** Web Programming

## Features

| Feature | Status |
|---|---|
| Signup / login with bcrypt + JWT, protected routes | Done |
| Student profiles (name, bio, university, department) | Done |
| Skill management from a shared skills list | Done |
| Search students by name/university and by skill they teach | Done |
| Mutual matching ranked by score `M(A,B) = \|TeachA ∩ LearnB\| + \|TeachB ∩ LearnA\|` | Done |
| Collaboration requests (send, accept, reject) | Done |
| Session tracking (pending → accepted → completed, or rejected) | Done |
| Stored messaging between connected students (not real-time) | Done |
| Ratings and reviews, only for completed sessions | Done |
| Dashboard with matches, requests, messages, reviews | Done |
| Responsive layout (desktop and mobile) | Done |

## Tech stack

- **Frontend:** React (Vite), React Router, Axios, plain CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Auth:** bcryptjs (password hashing), jsonwebtoken (JWT)

## Project structure

```
skillswap-student-skill-exchange/
├── client/                    React frontend (Vite)
│   ├── index.html
│   ├── vite.config.js         Proxies /api to the backend on port 5000
│   └── src/
│       ├── main.jsx           App entry: Router + AuthProvider
│       ├── App.jsx            All routes
│       ├── index.css          All styles
│       ├── api/axios.js       Axios instance, adds JWT to requests
│       ├── context/AuthContext.jsx
│       ├── utils/format.js
│       ├── components/        Navbar, ProtectedRoute, SkillPicker, StudentCard, ...
│       └── pages/             Landing, Login, Register, Dashboard, Profile, Explore,
│                              StudentProfile, Matches, Requests, Messages, Reviews, NotFound
└── server/                    Express backend
    ├── server.js              App entry
    ├── .env.example           Copy to .env and fill in
    ├── config/db.js           MongoDB connection
    ├── middleware/authMiddleware.js
    ├── models/                User, Skill, Request, Message, Review
    ├── controllers/           Logic for each feature
    ├── routes/                API endpoints
    └── utils/seedSkills.js    Fills the shared skills list on first run
```

## How to run

### Requirements
- Node.js 18 or newer
- MongoDB, either installed locally (MongoDB Community Server) or a free MongoDB Atlas cluster

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env` (copy `.env.example`):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/skillswap
JWT_SECRET=any_long_random_string
CLIENT_URL=http://localhost:5173
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string and add `/skillswap` before the `?`.

```bash
npm run dev
```

Expected output:

```
MongoDB connected: 127.0.0.1/skillswap
Seeded 24 skills
Server running on http://localhost:5000
```

("Seeded 24 skills" appears only the first time.)

### 2. Frontend (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## API endpoints

All routes except register, login and skills need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in, returns JWT |
| GET | /api/auth/me | Current user |
| GET | /api/skills | Shared skills list |
| GET | /api/users?skill=&q= | Search students |
| GET | /api/users/:id | Student profile + reviews |
| PUT | /api/users/profile | Update my profile and skills |
| GET | /api/matches | Ranked mutual matches |
| POST | /api/requests | Send a request |
| GET | /api/requests | My sent and received requests |
| PATCH | /api/requests/:id/status | Accept, reject or complete |
| GET | /api/messages/conversations | My conversations |
| GET | /api/messages/:userId | Messages with one student |
| POST | /api/messages/:userId | Send a message |
| POST | /api/reviews | Review a completed session |
| GET | /api/reviews/me | Reviews I received |

## Business rules

- A student is never matched with themselves.
- A match is mutual only if both students can teach the other something.
- Only one open (pending or accepted) request can exist between two students.
- Only the receiver can accept or reject; either side can mark an accepted request completed.
- Messaging is allowed only after a request between the two students is accepted.
- Reviews are allowed only for completed sessions, once per student per session.

## Out of scope

Real-time chat, payments and video calling.
