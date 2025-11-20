# Verse Memorization 📖

A full-stack TypeScript application for scripture memorization using flashcards and spaced repetition. Master Bible verses with an intelligent review system that optimizes your learning. Features integration with the official **ESV (English Standard Version) API** for automatic verse lookup and accurate text retrieval.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20%2B-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## 🌟 Features

- **ESV API Integration**: Automatically fetch verses from the official ESV API
- **Add Verses**: Easily add Bible verses with automatic lookup or manual entry
- **Flashcard Review**: Practice verses using an intuitive flashcard interface
- **Spaced Repetition**: Smart algorithm (SM-2) schedules optimal review times
- **Progress Tracking**: Monitor your learning progress with detailed statistics
- **Multiple Translations**: Support for ESV (primary), NIV, KJV, and more
- **User Authentication**: Secure login with Azure AD B2C (Apple ID + email/password)
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- React Router for navigation
- ESV API integration for automatic verse lookup

**Backend:**
- Node.js with Express and TypeScript
- PostgreSQL database with Prisma ORM
- JWT-based authentication
- RESTful API design

**Infrastructure:**
- Azure Static Web Apps (frontend hosting)
- Azure Container Apps (backend hosting)
- Azure Database for PostgreSQL
- Azure Container Registry
- Bicep for Infrastructure as Code

**DevOps:**
- Docker containers for consistency
- GitHub Codespaces for development
- GitHub Actions for CI/CD
- Automated testing and deployment

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

### ☁️ Deploy to Azure (Production)

Want to deploy to Azure? Follow our quick setup guide:

```bash
# 1. Deploy infrastructure
cd infra
az deployment sub create --location eastus --template-file main.bicep \
  --parameters environment=prod databasePassword="$(openssl rand -base64 32)" \
  --name verse-memorization-deployment

# 2. Configure everything automatically
cd .. && ./scripts/setup-azure.sh

# 3. Validate configuration
./scripts/validate-config.sh
```

📖 **See [Azure Quick Start Guide](./docs/QUICK_START_AZURE.md) for complete instructions**

### 💻 Local Development

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Git
- **ESV API Key** (free from https://api.esv.org)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/dsjohns85/verse-memorization.git
cd verse-memorization

# Start all services
docker-compose up
```

Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Database: localhost:5432

### Local Development

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# In a new terminal, install frontend dependencies
cd frontend
npm install
npm run dev
```

### GitHub Codespaces

1. Click the "Code" button on GitHub
2. Select "Codespaces" → "Create codespace on main"
3. Wait for the environment to set up automatically
4. Start coding!

## 📚 Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md) - Setup and installation
- [**Azure Quick Start**](./docs/QUICK_START_AZURE.md) - **Configure Azure in 5 steps** ⚡
- [Azure Setup Guide](./docs/AZURE_SETUP.md) - Detailed Azure configuration
- [API Documentation](./docs/API.md) - REST API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to Azure
- [Infrastructure Guide](./infra/README.md) - Azure resources and configuration

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

- Azure AD B2C for authentication
- JWT tokens for API access
- HTTPS only in production
- Environment variables for secrets
- Input validation and sanitization
- SQL injection prevention via Prisma

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
