# 🎯 VocabMaster: Full-Stack Vocabulary Learning App

VocabMaster is a modern, time-based vocabulary learning application designed to help users efficiently master new words through daily learning sessions and interactive practice.

---

## 🚀 Key Features

- **Session-Based Learning**: Create daily containers for your vocabulary words.
- **Dynamic Entry**: Flexible form to add multiple word-meaning pairs in one go.
- **Practice Mode**: Interactive learning session with word shuffling and real-time answer evaluation.
- **Smart Results**: Instant feedback with correct/incorrect indicators and detailed summaries.
- **Progressive Tracking**: Automatic timestamping and session status management (NEW → LEARNING → DONE).
- **Responsive UI**: Clean, minimalist design that works on all devices.

---

## 🛠 Tech Stack

### Backend
- **Java 17** & **Spring Boot 3.2**
- **Architecture**: Modular Monolith (layered structure: Controller -> Service -> Repository -> Domain)
- **Database**: PostgreSQL
- **Security/Persistence**: Spring Data JPA & Hibernate
- **Tools**: Lombok, Jakarta Validation

### Frontend
- **React 18** (Vite + TypeScript)
- **Styling**: Modern CSS3 (Variables, Flexbox, Grid)
- **Icons**: Lucide React
- **Networking**: Axios

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git

---

## 🏗 Architecture

The project follows a **Modular Monolith** approach, ensuring clear boundaries between domain areas while maintaining a simple deployment model.

```
vocab-learning-app/
├── backend/            # Spring Boot Application
│   ├── src/main/java/com/example/vocab/
│   │   ├── common/     # Shared enums, exceptions, utils
│   │   ├── session/    # Session domain logic
│   │   ├── word/       # Word management
│   │   └── learning/   # Evaluation logic
├── frontend/           # React TypeScript Application
└── docker-compose.yml  # Infrastructure as Code
```

---

## 🚦 Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js & npm (for local frontend development)
- Java 17+ (for local backend development)

### Quick Start (Docker)
The easiest way to run the entire stack:

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173` (if running locally)
- Backend API: `http://localhost:8080/api`

### Manual Setup

#### Backend
```bash
cd backend
./mvnw clean spring-boot:run
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔌 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sessions` | Create a new learning session |
| `GET` | `/api/sessions` | List all sessions (DESC order) |
| `PATCH`| `/api/sessions/{id}/status` | Update session status |
| `POST` | `/api/sessions/{id}/words` | Batch save words for a session |
| `POST` | `/api/sessions/{id}/submit`| Submit answers for evaluation |
| `GET` | `/api/sessions/{id}/results`| Retrieve session results |

---

## 📝 Validation Rules
- **Case-Insensitive**: Answers are evaluated regardless of casing (e.g., "Apple" == "apple").
- **Auto-Trim**: Leading/trailing spaces are ignored.
- **Order Agnostic**: Words are shuffled before each learning session to prevent rote position memorization.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
This project is licensed under the MIT License.
