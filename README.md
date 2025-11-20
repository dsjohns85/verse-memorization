# Verse Memorization 📖

A **simple, lightweight** full-stack TypeScript application for scripture memorization using flashcards and spaced repetition. Master Bible verses with an intelligent review system that optimizes your learning.

✨ **Deploy in 5 minutes** on free platforms like Railway, Render, or Fly.io
💰 **Zero to low cost** - Free tier options available
🚀 **No complex setup** - Works with SQLite or PostgreSQL
🤖 **AI-enabled** - Optional ESV API integration for automatic verse lookup

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20%2B-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## 🌟 Features

- **Flashcard Review**: Practice verses using an intuitive flashcard interface
- **Spaced Repetition**: Smart algorithm (SM-2) schedules optimal review times
- **Progress Tracking**: Monitor your learning progress with detailed statistics
- **Add Verses**: Easily add Bible verses with manual entry
- **Optional ESV API**: Automatically fetch verses from the official ESV API
- **Multiple Database Options**: SQLite (simple) or PostgreSQL (production)
- **Simple Authentication**: Development mode for easy testing, JWT ready for production
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- Simple API client with fetch

**Backend:**
- Node.js with Express and TypeScript
- SQLite (development) or PostgreSQL (production)
- Prisma ORM for database access
- Simple JWT-ready authentication
- RESTful API design

**Deployment Options:**
- **Railway.app** - Deploy with one click (Free tier available)
- **Render.com** - Free hosting for small projects
- **Fly.io** - Fast global deployment (Free tier available)
- **Docker** - Self-host on any VPS (Starting at $4/month)
- **Azure** - Enterprise option (Advanced setup in `docs/DEPLOYMENT.md`)

### Project Structure

```
verse-memorization/
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express API server
├── infra/             # Azure Bicep infrastructure templates
├── .devcontainer/     # GitHub Codespaces configuration
├── .github/workflows/ # CI/CD pipelines
└── docs/              # Comprehensive documentation
```

## 🚀 Quick Start

### ☁️ Deploy to Free Cloud Platform (Recommended)

**Deploy in 5 minutes** to Railway, Render, or Fly.io:

1. Fork this repository
2. Sign up at [Railway.app](https://railway.app) (or [Render](https://render.com))
3. Create new project from your fork
4. Add PostgreSQL database (or use SQLite)
5. Deploy! 🎉

📖 **See [docs/SIMPLE_DEPLOYMENT.md](./docs/SIMPLE_DEPLOYMENT.md)** for detailed step-by-step guides.

### 💻 Local Development

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose (optional)
- Git
- **ESV API Key** (optional, free from https://api.esv.org)

### Quick Start (SQLite - Simplest)

```bash
# Clone the repository
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# Install dependencies
npm install

# Set up backend with SQLite
cd backend
cp .env.example .env
# Edit .env to use SQLite (already configured by default)
npx prisma generate
npx prisma migrate dev
npm run dev

# In a new terminal, start frontend
cd frontend
npm install
npm run dev
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Using Docker (PostgreSQL)

```bash
# Clone the repository
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# Start all services with PostgreSQL
docker-compose up
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### GitHub Codespaces

1. Click the "Code" button on GitHub
2. Select "Codespaces" → "Create codespace on main"
3. Wait for the environment to set up automatically
4. Start coding!

## 📚 Documentation

- [Simple Deployment Guide](./docs/SIMPLE_DEPLOYMENT.md) - **Start here!** Deploy to free platforms
- [Getting Started Guide](./docs/GETTING_STARTED.md) - Setup and installation
- [API Documentation](./docs/API.md) - REST API reference
- [Azure Deployment Guide](./docs/DEPLOYMENT.md) - Advanced: Deploy to Azure (for enterprises)
- [Infrastructure Guide](./infra/README.md) - Advanced: Azure resources

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 🏃 Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests and linting: `npm test && npm run lint`
4. Commit your changes: `git commit -m "Add your feature"`
5. Push to your branch: `git push origin feature/your-feature`
6. Create a Pull Request

## 🔐 Security

- Simple development authentication for testing
- JWT-ready authentication for production
- HTTPS recommended for production
- Environment variables for secrets
- Input validation and sanitization
- SQL injection prevention via Prisma ORM

## 📈 Spaced Repetition Algorithm

The application uses the SuperMemo 2 (SM-2) algorithm for optimal review scheduling:

- **Quality ratings** (0-5): Rate how well you remember each verse
- **Ease Factor**: Adjusts based on your performance
- **Intervals**: Time between reviews increases with successful recalls
- **Repetitions**: Tracks how many times you've reviewed each verse

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Daniel Johns**

## 🙏 Acknowledgments

- SuperMemo 2 algorithm by Piotr Wozniak
- React and Vite communities
- Prisma team for the excellent ORM
- Azure team for cloud infrastructure

## 📞 Support

- Create an issue on [GitHub Issues](https://github.com/dsjohns85/verse-memorization/issues)
- Check the [documentation](./docs/)
- Review existing issues and discussions

---

**Made with ❤️ for scripture memorization**
