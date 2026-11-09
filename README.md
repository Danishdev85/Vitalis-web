# Vitalis Web

A full-stack web application for an online clinic — built as a portfolio project.

Vitalis is an imaginary online clinic with no physical workspace. Patients can browse the clinic, its departments and doctors, and book a session online. An admin can manage doctors and set up each doctor's schedule. The project is built so it can be adapted to a real clinic's requirements and turned into a live project.

> **Status:** Portfolio project — not live anywhere yet.

## What it does

### For patients
- Browse the clinic, services, departments and doctors
- Book an appointment / session with a doctor, choosing a date and time slot
- Look up a booking with its confirmation code
- Send a message through the contact form

### For the admin
- Log in with JWT authentication
- Add and manage doctors
- Set up and manage each doctor's weekly schedule / availability
- View appointments, stats and contact messages on the admin dashboard

### Departments included
Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, General Medicine, ENT, Gynecology and Dentistry.

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MySQL / MariaDB (`mysql2`) |
| Auth | JSON Web Tokens (`jsonwebtoken`), passwords hashed with `bcryptjs` |

## Project structure

```
Vitalis-web/
├── client/      # React + Vite frontend
├── server/      # Express API
└── database/    # MySQL schema (vitalis_clinic.sql)
```

## Getting started

### 1. Database

Create the database and import the schema:

```bash
mysql -u root -p -e "CREATE DATABASE vitalis_clinic;"
mysql -u root -p vitalis_clinic < database/vitalis_clinic.sql
```

The SQL file contains the table structure and the department list only. Sample patient, appointment and contact data was removed for privacy.

Create an admin account with the helper script in `server/` (see `server/hashPassword.js`).

### 2. Server

```bash
cd server
npm install
cp .env.example .env   # then fill in your own values
npm run dev            # runs on http://localhost:5000
```

### 3. Client

```bash
cd client
npm install
npm run dev            # runs on http://localhost:5173
```

## API

Base URL: `http://localhost:5000`

| Route | Purpose |
| --- | --- |
| `GET /` | Health check |
| `/api/doctors` | Doctors |
| `/api/departments` | Departments |
| `/api/appointments` | Book / look up appointments |
| `/api/availability` | Doctor availability and time slots |
| `/api/contact` | Contact messages |
| `/api/stats` | Dashboard stats |
| `/api/admin` | Admin login and management |

## Notes

- This is a portfolio / demo project for an imaginary clinic. It is not a real clinic and has no physical location.
- Never commit a real `.env` file or passwords to GitHub. Use `.env.example` as the template.
- The `client/src/assets/hero.png` image and `client/public/favicon.png` are not included in the first upload — add your own images there if you want them in the repo.
