<div align="center">
  <img src="docs/assets/logo.png" alt="Sense-Lib Logo" width="200"/>
  
  # Sense-Lib
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Python Version](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  [![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
  
  A comprehensive digital library system with AI-powered knowledge management and intelligent document search capabilities.
  
  [Features](#features) • [Installation](#installation) • [Documentation](#api-documentation) • [Contributing](#contributing)
</div>

---

## 📚 Overview

Sense-Lib is a modern digital library system that combines traditional library management with advanced AI features. It provides an intelligent platform for document management, search, and knowledge discovery.

<div align="center">
  <img src="docs/assets/architecture.png" alt="System Architecture" width="800"/>
</div>

## 🏗️ Project Structure

```
senselib/
├── frontend/                 # Frontend application (React + Vite)
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Dependencies
├── backend/                 # Backend application (FastAPI)
│   ├── app/                # Application code
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── models/        # Database models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── data/              # Data storage
│   └── tests/             # Test files
└── docs/                   # Documentation
```

## ✨ Features

### 🎯 Core Features

<table>
<tr>
<td width="50%">

#### 📚 Document Management
- Upload and organize documents
- Document versioning
- Metadata management
- Document preview

#### 🔍 Intelligent Search
- AI-powered semantic search
- RAG (Retrieval-Augmented Generation) system
- Advanced filtering and sorting
- Full-text search capabilities

</td>
<td width="50%">

#### 👥 User Management
- User authentication and authorization
- Role-based access control
- User profiles and preferences
- Reading progress tracking

#### 📊 Analytics & Reporting
- Usage statistics
- Reading analytics
- User engagement metrics
- System performance monitoring

</td>
</tr>
</table>

### 🛠️ Technical Features

<div align="center">

| Backend | Frontend | Database | DevOps |
|:--------|:---------|:---------|:-------|
| FastAPI | React | PostgreSQL | Docker |
| Python | TypeScript | Vector DB | GitHub Actions |
| JWT Auth | Material-UI | Redis | Nginx |
| RAG System | Redux | Elasticsearch | AWS |

</div>

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- PostgreSQL 13+
- Node.js 16+ (for frontend)
- npm 8+ (for frontend)
- Docker (optional)

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/anhngocdang2723/sense-lib.git
cd sense-lib

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Initialize database
alembic upgrade head
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# VITE_API_URL=http://localhost:8000
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start backend
cd backend
uvicorn app.main:app --reload

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Production Mode

```bash
# Using Docker Compose
docker-compose up -d
```

## 📦 Frontend Dependencies

The frontend uses the following main dependencies:
- React 18
- Vite
- React Router DOM
- Plain CSS (no CSS framework)

To install all dependencies:
```bash
cd frontend
npm install
```

## 🔧 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/senselib
SECRET_KEY=your-secret-key
```

## 📖 API Documentation

<div align="center">

| Documentation | URL |
|:-------------|:----|
| Swagger UI | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

</div>

## 🤝 Contributing

We love your input! We want to make contributing to Sense-Lib as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

### Development Process

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

<div align="center">

| Role | Name | Contact |
|:-----|:-----|:--------|
| Lead Developer | [@anhngocdang2723](https://github.com/anhngocdang2723) | [Email](mailto:your.email@example.com) |

</div>

## 📞 Contact

- GitHub: [@anhngocdang2723](https://github.com/anhngocdang2723)
- Project Link: [https://github.com/anhngocdang2723/sense-lib](https://github.com/anhngocdang2723/sense-lib)

---

<div align="center">
  Made with ❤️ by the Sense-Lib Team
</div> 