# Interva

AI-powered interview tracking application.

A fullstack web app that allows users to track job applications, manage interview rounds, and generate AI-based interview questions.

---

## Tech Stack

### Frontend
- React (TypeScript)/Vite
- Firebase Authentication
- Tailwind CSS

### Backend
- NestJS (TypeScript)
- Node.js
- PostgreSQL
- Prisma ORM
- Firebase Admin SDK (token validation)

---

## Features

- Email/password authentication via Firebase
- Server-side Firebase ID token validation
- CRUD for job applications
- CRUD for interview rounds
- AI-generated interview questions per round
- All data scoped to authenticated user

---

## Authentication Flow

1. User signs in with Firebase on the frontend.
2. Firebase issues an ID token.
3. Frontend sends requests with:

   Authorization: Bearer <ID_TOKEN>

4. NestJS verifies the token using Firebase Admin SDK.
5. Protected routes reject invalid or missing tokens.

Passwords are not stored in PostgreSQL.

---

## Core Entities

### User
- id
- firebaseUid
- email

### Application
- id
- userId
- company
- role
- status
- jobDescription

### InterviewRound
- id
- applicationId
- roundType
- date
- notes
- outcome

### GeneratedQuestion
- id
- interviewRoundId
- questionText

---

## Sample API Routes

### Applications
GET /applications  
POST /applications  
PATCH /applications/:id  
DELETE /applications/:id  

### Interview Rounds
POST /applications/:id/rounds  
PATCH /rounds/:id  
DELETE /rounds/:id  

### AI
POST /rounds/:id/generate-questions  

---

## Project Goals

- Demonstrate a complete fullstack application
- Implement secure backend token validation
- Design relational database models
- Build structured REST APIs
- Integrate AI into a real workflow