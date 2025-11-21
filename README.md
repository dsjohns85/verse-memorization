# Verse Memorization 📖

A full-stack TypeScript application for scripture memorization using flashcards and spaced repetition. Master Bible verses with an intelligent review system that optimizes your learning.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-20%2B-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

## 🌟 Features

- **Flashcard Review**: Practice verses using an intuitive flashcard interface
- **Spaced Repetition**: Smart algorithm (SM-2) schedules optimal review times
- **Progress Tracking**: Monitor your learning progress with detailed statistics
- **Add Verses**: Easily add Bible verses with manual entry
- **Optional ESV API**: Automatically fetch verses from the official ESV API
- **SQLite Database**: Simple file-based database, no server needed
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
- Azure Functions with TypeScript
- SQLite database (file-based, zero-config)
- Direct SQL queries with better-sqlite3
- Simple JWT-ready authentication
- RESTful API design

**Deployment:**
- **Azure Static Web Apps** - Integrated Functions (see `docs/DEPLOYMENT.md`)

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

### GitHub Codespaces (Recommended)

1. Click the "Code" button on GitHub
2. Select "Codespaces" → "Create codespace on main"
3. Wait for the environment to set up automatically
4. Codespace includes VS Code, all dependencies, and Azure Functions tools

### Azure Deployment

Deploy to Azure Static Web Apps:

1. Create Static Web App in Azure Portal
2. Connect to this GitHub repository  
3. Azure automatically builds and deploys
4. Cost: Free tier or $9/month

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md) - Detailed setup and installation
- [API Documentation](./docs/API.md) - REST API reference
- [Azure Deployment Guide](./docs/DEPLOYMENT.md) - Deploy to Azure
- [Infrastructure Guide](./infra/README.md) - Azure resources
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
- HTTPS enforced in Azure
- Environment variables for secrets
- Input validation and sanitization
- SQL injection prevention via parameterized queries

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
