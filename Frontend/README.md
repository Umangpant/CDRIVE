# CDrive Frontend

React + Vite frontend for the CDrive application.

## Local Run

1. Make sure the backend is available on `http://localhost:8080`.
2. Start the dev server:
   `npm run dev`
3. Open:
   `http://localhost:5173`

## Environment

- `VITE_API_BASE_URL=/api`
  Keeps browser requests relative so the Vite dev server can proxy them.
- `VITE_PROXY_TARGET=http://localhost:8080`
  Backend target used in local development.
- `VITE_PORT=5173`
  Frontend dev-server port.

## Backend Notification Integration

- User registration uses `POST /api/auth/signup`
- Admin registration uses `POST /api/admin/signup`
- Reservation approval uses `POST /api/reservations/{id}/approve`

The registration screen and admin dashboard are aligned with the backend email-notification flow.
