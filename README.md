# TickBook Frontend

React SPA frontend for the [TickBook](https://github.com/nmdra/TickBook) microservices platform. All API calls are routed through a single Kubernetes Gateway using path-based routing.

## Tech Stack

- **React 19** with Vite
- **Tailwind CSS v4** for styling
- **Axios** with JWT interceptors
- **React Router v7** for client-side routing

## Architecture

```
Frontend (SPA)
    │
    ▼
API Gateway (e.g. https://api.yourdomain.com)
    │
    ├── /api/users/*    → User Service
    ├── /api/events/*   → Event Service
    ├── /api/bookings/* → Booking Service
    └── /api/payments/* → Payment Service
```

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure the API Gateway URL
cp .env.example .env

# Start dev server
npm run dev
```

## Environment Variables

| Variable             | Description                  | Default                  |
| -------------------- | ---------------------------- | ------------------------ |
| `VITE_API_BASE_URL`  | Base URL of the API Gateway  | `http://localhost:8080`  |

## Project Structure

```
src/
├── components/
│   ├── auth/          # LoginForm, RegisterForm
│   ├── booking/       # BookingModal
│   ├── events/        # EventList, EventCard
│   ├── layout/        # Navbar
│   └── payment/       # CheckoutFlow, PaymentSuccess
├── context/           # AuthContext (React Context)
├── pages/             # Route-level page components
└── services/          # Centralized Axios API client
```

## Docker Deployment

```bash
docker build -t tickbook-frontend .
docker run -p 3000:80 tickbook-frontend
```
