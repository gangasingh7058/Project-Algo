# 🚀 CodeArcade – Distributed Online Judge & Code Execution Platform

[![Live Platform](https://img.shields.io/badge/Live-codearcade.gangasingh.me-brightgreen?style=for-the-badge&logo=vercel)](https://codearcade.gangasingh.me)
[![Docker Hub](https://img.shields.io/badge/Docker_Hub-gtinna005-blue?style=for-the-badge&logo=docker)](https://hub.docker.com/u/gtinna005)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-Event_Queue-231F20?style=for-the-badge&logo=apachekafka)](https://kafka.apache.org)

**CodeArcade** is a full-stack, microservice-based Online Judge (OJ) and competitive programming platform. It features an asynchronous multi-language code execution engine, real-time submission evaluation via Apache Kafka, an interactive web IDE with Monaco Editor, and an AI-driven debugging assistant powered by Google Gemini API & Model Context Protocol (MCP).

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Client ["Client Layer"]
        FE["React + Vite Frontend<br/>(Monaco & CodeMirror IDE)"]
    end

    subgraph Edge ["API Gateway / Backend Service"]
        BE["Node.js Express Backend<br/>(Port 3001)"]
        AUTH["JWT Auth & User Session"]
        PRISMA["Prisma ORM"]
    end

    subgraph Data ["Data & Messaging Layer"]
        PG[("PostgreSQL Database<br/>(Users, Problems, Solves)")]
        REDIS[("Redis Cache<br/>(Port 6379)")]
        KAFKA[("Apache Kafka Event Stream<br/>(Port 9092)")]
    end

    subgraph Workers ["Execution & AI Engine"]
        COMPILER["Compiler Microservice<br/>(Port 3002 / Sandboxed Execution)"]
        MCP["MCP Server<br/>(Port 3003 / AI Context Tools)"]
        GEMINI["Google Gemini API<br/>(Hints & Code Analysis)"]
    end

    FE -->|HTTP / REST| BE
    BE --> AUTH
    BE --> PRISMA
    PRISMA --> PG
    BE -->|Cache State| REDIS
    BE -->|Dispatch Submission Jobs| KAFKA
    KAFKA -->|Consume & Execute Code| COMPILER
    COMPILER -->|Evaluation Results| BE
    FE -->|AI Hint & Debug Requests| BE
    BE -->|Gemini API| GEMINI
    MCP -->|Tools| COMPILER
```

---

## ⚡ Key Features

- 🧠 **Problem Solving & Practice Hub**: Algorithmic problem bank with tag filtering, difficulty levels (Easy, Medium, Hard), test case verification, and search capability.
- 👨‍💻 **Interactive In-Browser IDE**: Monaco Editor & CodeMirror integration supporting syntax highlighting, dynamic themes, keyboard shortcuts, and full-screen workspace.
- 🚀 **Multi-Language Execution Engine**: Execute C++, Python, JavaScript securely in isolated sandboxed microservice environments with strict runtime boundaries.
- ⏱️ **Asynchronous Event Stream**: Apache Kafka and Redis power the submission evaluation queue to prevent bottlenecks under heavy concurrent load.
- 🤖 **AI Assistant & Hint Generator**: Integrated with Google Gemini API & MCP Server for automated error diagnostics, step-by-step hints, and complexity analysis without spoiling full solutions.
- 📈 **User Profile & Submissions Dashboard**: Real-time evaluation results showing Verdict (Accepted, Wrong Answer, TLE, Compilation Error), Runtime performance, and submission logs.
- 🐳 **Microservice Infrastructure**: Completely dockerized microservice stack with Docker Compose and pre-built Docker Hub images.

---

## 🛠 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Monaco Editor (`@monaco-editor/react`), CodeMirror, Framer Motion, Lucide Icons, Three.js |
| **Backend** | Node.js, Express 5, Prisma ORM, JWT, Bcrypt |
| **Compiler Microservice** | Node.js, Strategy Pattern Language Registry (`C++`, `Python`, `JavaScript`), Dockerized Sandbox |
| **AI & MCP** | Model Context Protocol (`@modelcontextprotocol/sdk`), Google Gemini API (`@google/genai`) |
| **Database & Cache** | PostgreSQL, Redis 7 (Alpine) |
| **Message Broker** | Apache Kafka (KRaft mode) |
| **DevOps & Containers** | Docker, Docker Compose, Vercel |

---

## 📁 Repository Structure

```
ALGO/
├── Backend/                    # Express API Gateway, Auth, Database models, Gemini AI routes
│   ├── prisma/                 # PostgreSQL Database Schema & Migrations
│   ├── routes/                 # Problem, User, Submission, and AI Routes
│   └── Dockerfile              # Dockerfile for Backend Service
├── Compiler/                   # Isolated Code Execution Microservice
│   ├── Help_Functions/         # Code writing, input processing & execution utilities
│   ├── languages/              # Strategy Handlers (Cpp, Python, JS)
│   └── Dockerfile              # Dockerfile for Compiler Service
├── Frontend/Online_Judge_FE/   # React + Vite Frontend Application
│   ├── src/
│   │   ├── Components/         # Code Area, Problem Solvers, Navbar, AI Assistant UI
│   │   ├── Pages/              # Problem Bank, Compiler Page, Dashboard, Submissions
│   │   └── App.jsx
│   └── vercel.json             # Frontend Deployment Configuration
├── MCP_Server/                 # Model Context Protocol Server for Code Compiler tools
│   ├── mcp_server.js           # MCP Server & Tool Definitions
│   └── Dockerfile              # Dockerfile for MCP Service
└── docker-compose.yml          # Full-stack Docker Compose Configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** & **Docker Desktop** (for containerized execution)
- **PostgreSQL** instance (or Neon DB connection string)

---

### Option 1: Run with Docker Compose (Recommended)

To launch the complete infrastructure (Backend, Compiler, MCP Server, Redis, Kafka) with a single command:

```bash
# Clone the repository
git clone https://github.com/gangasingh7058/Project-Algo.git
cd Project-Algo

# Start all services
docker-compose up --build -d
```

The services will be available at:
- **Frontend**: Launch `Frontend/Online_Judge_FE` locally or visit live at [codearcade.gangasingh.me](https://codearcade.gangasingh.me)
- **Backend API**: `http://localhost:3001`
- **Compiler Microservice**: `http://localhost:3002`
- **MCP Server**: `http://localhost:3003`
- **Redis Cache**: `localhost:6379`
- **Kafka Broker**: `localhost:9092`

---

### Option 2: Manual Local Setup

#### 1. Setup Backend

```bash
cd Backend
npm install
npx prisma generate
npx prisma db push
npm start
```

#### 2. Setup Compiler Service

```bash
cd Compiler
npm install
node index.js
```

#### 3. Setup MCP Server

```bash
cd MCP_Server
npm install
npm start
```

#### 4. Setup Frontend

```bash
cd Frontend/Online_Judge_FE
npm install
npm run dev
```

---

## 🔑 Environment Variables Configuration

Create `.env` files in each service directory based on the following templates:

### `Backend/.env`
```env
PORT=3001
DATABASE_URL="postgresql://user:password@localhost:5432/codearcade"
JWT_PASSKEY="your_jwt_secret_key"
GOOGLE_GEMINI_API_KEY="your_google_gemini_api_key"
COMPILER_PORT="http://localhost:3002"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKER="localhost:9092"
SALT_ROUNDS=10
```

### `Compiler/.env`
```env
PORT=3002
KAFKA_BROKER="localhost:9092"
```

### `Frontend/Online_Judge_FE/.env`
```env
VITE_BACKEND_PORT="http://localhost:3001"
VITE_COMPILER_PORT="http://localhost:3002"
```

### `MCP_Server/.env`
```env
PORT=3003
COMPILER_URL="http://localhost:3002"
```

---

## 🐳 Docker Images

Pre-built Docker images are maintained on Docker Hub:

- **Backend**: `gtinna005/codearcade-backend:latest`
- **Compiler**: `gtinna005/codearcade-compiler:latest`
- **MCP Server**: `gtinna005/codearcade-mcp:latest`

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/gangasingh7058/Project-Algo/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **ISC License**. See `LICENSE` for more details.
