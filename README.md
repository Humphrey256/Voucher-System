# MURONI WiFi Voucher System

A full-stack application for managing WiFi vouchers, featuring a Django backend and a React (Vite) frontend. Designed for integration with ZTE GPON ONT (ZXHN F670L) routers and branded as MURONI.

## Project Overview
This system allows administrators to generate, manage, and monitor WiFi access vouchers, with a user-friendly dashboard and support for captive portal integration on compatible ZTE routers.

## Features
- Voucher generation (bulk, custom duration, data limits)
- Voucher status workflow (pending, active, used, expired, disabled)
- Dashboard with stats and recent activity
- Search, filter, and print voucher codes
- Live countdown timer for voucher usage
- MURONI branding throughout
- Captive portal login page for voucher redemption
- ZTE router integration (where supported)

## Tech Stack
- **Backend:** Django, Django REST Framework
- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Other:** Python, Node.js, npm, bun

## Setup Instructions

### Backend (Django)
1. `cd backend`
2. Create and activate a virtual environment:
   ```bash
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the backend server:
   ```bash
   python manage.py runserver
   ```

### Frontend (React + Vite)
1. `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
3. Start the frontend dev server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

## Usage
- Access the admin dashboard via the frontend URL (default: `http://localhost:5173`).
- Use the dashboard to generate, manage, and print vouchers.
- For captive portal integration, configure your ZTE router (if supported) to redirect to the login page.
- Redeem vouchers via the branded captive portal page.

## ZTE Router Integration
- The system is designed for ZTE GPON ONT (ZXHN F670L) routers with captive portal support.
- If your router does not support captive portal, you can still use the system for manual voucher management.

## License
MIT License 