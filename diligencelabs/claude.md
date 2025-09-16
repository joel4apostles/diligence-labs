Build a Blockchain Consultant & Advisory Website
Goal

Develop a secure, modern, and mobile-friendly Blockchain Consultant and Advisory website with user authentication (email, social login, wallet connect), a user dashboard, and backend integration with a database and blockchain services. The site should be inspired by kynesys.xyz
 in terms of design aesthetic and flow.

The platform will allow users to:

Register and log in using email, social accounts (Google, Twitter, GitHub), or blockchain wallet addresses (WalletConnect, MetaMask, Coinbase Wallet, etc.).

Access a personal dashboard where they can request consultation and advisory services.

View project updates, advisory notes, and due diligence reports.

Manage their profile securely.

Persona

You are building for a Blockchain Consultant and Advisory Expert who:

Provides advisory services for new and existing blockchain projects.

Performs due diligence on blockchain ecosystems.

Offers consulting sessions and manages advisory engagements.

Requirements
Frontend

Framework: React + Next.js (App Router)

Styling: TailwindCSS + shadcn/ui

Design: Inspired by kynesys.xyz
, clean, minimal, professional.

Authentication:

Email + Password (JWT)

OAuth2 (Google, GitHub, Twitter) via NextAuth.js

Blockchain Wallet Connect (MetaMask, WalletConnect, Coinbase Wallet)

Mobile-first, responsive design with dark/light mode support.

Backend

Framework: Next.js API routes (serverless) or Node.js/Express (if separate backend)

Database: PostgreSQL (via Prisma ORM)

Authentication & Security:

JWT sessions with secure refresh tokens.

Hashed passwords (bcrypt/argon2).

CSRF protection and rate limiting for auth routes.

Store:

User profiles (email, social ID, wallet address)

Advisory session bookings

Consultation notes & due diligence reports

Blockchain Integration

Wallet connection via wagmi + RainbowKit.

Store wallet addresses linked to user profiles.

Enable secure signature verification (EIP-4361 Sign-In with Ethereum).

Features

Landing Page with services overview, CTA, and "Book a Consultation" flow.

Authentication Page with multiple login options (email, social, wallet).

Dashboard (after login):

Book a consultation session.

Upload/request due diligence reports.

View advisory updates.

Profile & settings management.

Admin Dashboard (for consultant only):

Manage clients.

Upload advisory content.

Track engagements.

Security Best Practices

Encrypt sensitive user data.

Use https only for all requests.

Validate blockchain wallet ownership via on-chain signature challenge.

Input validation & sanitization to prevent injection attacks.

Role-based access control (Admin vs. User).

Development Steps

Setup Project

Initialize Next.js + TailwindCSS + shadcn/ui

Configure Prisma + PostgreSQL

Install NextAuth.js + wallet libraries

Build Frontend Pages

Landing page (overview of services)

Login/Register page (email, social, wallet connect)

Dashboard (user view + admin view)

Implement Authentication

Email/password with JWT

Social login (Google, Twitter, GitHub)

Wallet connect with signature verification

Database Schema (Prisma)

Users (id, email, social_id, wallet_address, role)

Sessions (id, user_id, consultation_details, status)

Reports (id, user_id, file_link, status)

Secure API Routes

Auth (register, login, logout)

Dashboard data fetch

Consultation booking

Report upload/view

Blockchain Integration

Wallet connect flow

Sign-In with Ethereum (EIP-4361)

Store wallet in profile

Testing & Security Review

Test authentication flows

Validate database security (no plain text passwords)

Check wallet signature flows

Deployment

Deploy frontend/backend on Vercel or AWS

Database on Supabase or Neon PostgreSQL

Secure environment variables with .env

Deliverables

Production-ready Next.js site

Secure backend with database integration

Wallet connect + social login

User dashboard & admin dashboard

Documentation (setup + usage guide)