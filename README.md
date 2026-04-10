<div align="center">

```
 ██████╗██████╗ ██████╗ ██╗██╗   ██╗███████╗
██╔════╝██╔══██╗██╔══██╗██║██║   ██║██╔════╝
██║     ██║  ██║██████╔╝██║██║   ██║█████╗  
██║     ██║  ██║██╔══██╗██║╚██╗ ██╔╝██╔══╝  
╚██████╗██████╔╝██║  ██║██║ ╚████╔╝ ███████╗
 ╚═════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚══════╝
```

**Full-Stack Car Rental Platform**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

*Browse. Book. Drive.*

[Features](#-core-features) · [Architecture](#-system-architecture) · [Getting Started](#-getting-started) · [Deployment](#-deployment)

</div>

---

## 🚗 About CDRIVE

CDRIVE is a production-ready, full-stack car rental platform that enables users to browse available vehicles, make reservations, and receive instant booking confirmations — all backed by secure authentication and event-driven asynchronous processing.

> Built with **React + Vite** on the frontend and **Spring Boot** on the backend, CDRIVE handles the complete rental lifecycle: from car discovery to booking confirmation emails delivered via a **RabbitMQ** message queue.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), Bootstrap, Axios, Context API |
| **Backend** | Spring Boot, Spring Security (JWT), Spring Data JPA |
| **Database** | MySQL |
| **Messaging** | RabbitMQ, SMTP Email Service |
| **Auth** | JWT (JSON Web Tokens), Role-based Access Control |

---

## 📁 Project Structure

```
CDRIVE/
├── Backend/                        # Spring Boot application
│   ├── src/main/java/
│   │   ├── controller/             # REST API controllers
│   │   ├── service/                # Business logic
│   │   ├── repository/             # JPA repositories
│   │   ├── model/                  # Entity classes
│   │   ├── security/               # JWT & Spring Security config
│   │   ├── messaging/              # RabbitMQ producers & consumers
│   │   └── dto/                    # Data transfer objects
│   ├── src/main/resources/
│   │   └── application.properties  # App configuration
│   └── pom.xml
│
└── Frontend/                       # React + Vite application
    ├── src/
    │   ├── components/             # Reusable UI components
    │   ├── pages/                  # Route-level pages
    │   ├── context/                # Context API (auth, state)
    │   ├── services/               # Axios API service calls
    │   └── assets/                 # Images, icons
    ├── index.html
    └── vite.config.js
```

---

## ✨ Core Features

- 🔐 **JWT Authentication** — Secure login/register with token-based sessions
- 👥 **Role-Based Access** — Separate Admin and User permissions
- 🚙 **Car Listings** — Browse, filter, and view vehicle details
- 📅 **Booking System** — Reserve cars with date selection and availability checks
- 📧 **Email Notifications** — Instant booking confirmation via SMTP
- ⚡ **Async Processing** — RabbitMQ queue handles background tasks without blocking requests
- 📱 **Responsive UI** — Bootstrap-powered design that works across all screen sizes

---

## 🔄 Application Flow

### 1. Authentication Flow
```
User submits credentials
        │
        ▼
Backend validates → generates JWT
        │
        ▼
Token stored in client (localStorage / Context)
        │
        ▼
All subsequent API requests include JWT in Authorization header
```

### 2. Booking Flow
```
User selects car + dates
        │
        ▼
Axios POST → /api/bookings
        │
        ▼
Backend: validates availability → creates reservation → saves to DB
        │
        ▼
Booking event published to RabbitMQ queue
        │
        ▼
Consumer processes event → triggers Email Service → User receives confirmation
```

---

## 🧠 System Architecture

```
          ┌─────────────────────┐
          │      Frontend       │
          │   React + Vite      │
          │   Bootstrap + Axios │
          └────────┬────────────┘
                   │
                   │  HTTPS  (JWT in headers)
                   │
                   ▼
          ┌─────────────────────┐
          │       Backend       │
          │    Spring Boot      │
          │  Spring Security    │
          │   Spring Data JPA   │
          └────────┬────────────┘
                   │
        ┌──────────┴───────────┐
        │                      │
        ▼                      ▼
 ┌─────────────┐       ┌──────────────┐
 │  Database   │       │   RabbitMQ   │
 │MySQL / PgSQL│       │   Message    │
 │             │       │    Queue     │
 └─────────────┘       └──────┬───────┘
                               │
                               ▼
                       ┌──────────────┐
                       │   Consumer   │
                       │  (Listener)  │
                       └──────┬───────┘
                               │
                               ▼
                       ┌──────────────┐
                       │ Email Service│
                       │    (SMTP)    │
                       └──────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- MySQL or PostgreSQL running locally
- RabbitMQ running locally (or use [CloudAMQP](https://www.cloudamqp.com/) free tier)

### Backend Setup

```bash
# Navigate to backend
cd Backend

# Configure your database and RabbitMQ in:
# src/main/resources/application.properties

# Run the Spring Boot app
./mvnw spring-boot:run
```

**Key properties to configure:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/cdrive
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.rabbitmq.host=localhost
spring.rabbitmq.port=5672

jwt.secret=your_jwt_secret_key
```

### Frontend Setup

```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Create a .env file
echo "VITE_API_URL=http://localhost:8080" > .env

# Start development server
npm run dev
```

> 🌐 App will be available at `http://localhost:5173`

---

## 🌐 Deployment

| Service | Platform | Free Tier |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | ✅ Yes |
| **Backend** | [Render](https://render.com) | ✅ Yes |
| **Database** | [Neon](https://neon.tech)  | ✅ Yes |
| **Queue** | [CloudAMQP](https://cloudamqp.com) | ✅ Yes |

### Deploy Backend (Render)

1. Connect your GitHub repo on [Render](https://render.com)
2. Set **Root Directory** → `Backend`
3. Set **Build Command** → `./mvnw clean package -DskipTests`
4. Set **Start Command** → `java -jar target/*.jar`
5. Add environment variables for DB, RabbitMQ, JWT, and SMTP

### Deploy Frontend (Vercel)

1. Import your GitHub repo on [Vercel](https://vercel.com)
2. Set **Root Directory** → `Frontend`
3. Set **Framework Preset** → Vite
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
5. Deploy ✅

### CORS Configuration (Important!)

In your Spring Boot backend, allow requests from your Vercel domain:

```java
@CrossOrigin(origins = "https://your-app.vercel.app")
// or configure globally in SecurityConfig
```

---

## 📸 UI Overview

The frontend is built with Bootstrap, featuring a clean and responsive interface:

- 🚗 Car listing cards with images, specs, and daily pricing
- 📅 Booking flow with date pickers and availability checks
- 🔑 Authentication pages (Login / Register)
- 🛡️ Protected routes based on role (Admin / User)
- 📱 Fully responsive navbar and layouts

---

## 👨‍💻 Author

**Umang Pant**

[![GitHub](https://img.shields.io/badge/GitHub-Umangpant-181717?style=for-the-badge&logo=github)](https://github.com/Umangpant)

---

<div align="center">

If you found this project useful, please consider giving it a ⭐ on GitHub!

*Built with ☕ and Spring Boot*

</div>
