# 🏈 FairPlay NIL Platform

A comprehensive Name, Image, and Likeness (NIL) platform for college athletes, brands, and collectives. Built with React, FastAPI, and Supabase to streamline NIL deal valuation, management and compliance tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Git

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd fairplay-nil

# Start both frontend and backend automatically
./start-local-dev.sh
```

**For detailed setup instructions, see [Local Development Guide](docs/getting-started/local-development.md)**

## 📚 Documentation

### Getting Started
- **[Local Development](docs/getting-started/local-development.md)** - Complete setup and testing guide
- **[Testing Setup](docs/getting-started/local-development.md#playwright-reference-only)** - Reference Playwright info

### Development
- **[Database Guide](docs/development/database/supabase-guide.md)** - Complete Supabase database documentation
- **[Code Quality](docs/development/code-quality/improvements.md)** - Performance and security improvements
- **[Testing Protocol](docs/testing/testing-protocol.md)** - Comprehensive testing strategy and guidelines
- **[Environment Setup](docs/getting-started/environment-setup.md)** - Complete environment configuration guide

### Features
- **[Deal Wizard Bug Fixes](docs/features/deal-wizard/bug-fixes.md)** - Recent bug fixes and improvements

### Archive
- **[Old Documentation](docs/archive/old-docs/)** - Historical test documentation

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Chakra UI** - Component library
- **Playwright** - Reference E2E flows (Chrome-only, on-demand)

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database (via Supabase)
- **Supabase** - Backend-as-a-Service
- **Pydantic** - Data validation

### Infrastructure
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **Supabase** - Database and authentication
- **GitHub Actions** - CI/CD pipeline

## 🎯 Key Features

### For Athletes
- **Deal Creation** - Comprehensive deal wizard with activity selection
- **Social Media Integration** - Platform tracking for NIL compliance
- **Profile Management** - University and sport information
- **Compliance Tracking** - Deal status and approval workflow

### For Brands & Collectives
- **Athlete Discovery** - Search and filter by university, sport, division
- **Deal Management** - Track deal status and compliance
- **Contact Management** - Payor information and communication

### For Universities
- **Athlete Profiles** - University-specific athlete information
- **Compliance Monitoring** - Track NIL activities and approvals

## 🔧 Development Workflow

### Local Development
1. **Start Environment** - Use `./start-local-dev.sh` for automated setup
2. **Make Changes** - Frontend auto-reloads, backend auto-reloads
3. **Test Changes** - Run unit/integration tests with `npm test`
4. **Deploy** - Push to GitHub for automatic deployment

### Testing Strategy
- **Unit Tests** - Component and utility testing
- **E2E Tests** - On-demand Playwright reference flows only
- **API Tests** - FastAPI endpoint testing
- **Database Tests** - Migration and query testing

### Deployment
- **Automatic** - GitHub Actions runs tests and deploys on push
- **Environment** - Multi-environment support (local, staging, production)
- **Monitoring** - Sentry integration for error tracking

## 📊 Project Structure

```
fairplay-nil/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── context/         # React context providers
│   │   └── hooks/           # Custom React hooks
│   ├── tests/               # Playwright E2E tests
│   └── public/              # Static assets
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/             # API endpoints
│   │   ├── middleware/      # Request/response middleware
│   │   └── schemas.py       # Pydantic models
│   └── migrations/          # Database migrations
├── docs/                    # 📚 Documentation (NEW)
│   ├── getting-started/     # Setup and development guides
│   ├── development/         # Technical documentation
│   ├── features/            # Feature-specific docs
│   └── archive/             # Historical documentation
└── .cursor/rules/           # 🔒 AI assistant configuration (PROTECTED)
```

## 🚨 Important Notes

### Critical Dependencies
- **Supabase Python Library**: Must use `supabase>=2.16.0` (see [Database Guide](docs/development/database/supabase-guide.md))
- **Environment Variables**: Required for local development (see [Local Development Guide](docs/getting-started/local-development.md))

### Security
- **Authentication**: Supabase Auth integration
- **Database**: Row-level security (RLS) enabled
- **File Uploads**: Restricted file types and size limits
- **Environment**: Secure credential management

## 🤝 Contributing

### Development Guidelines
1. **Follow Patterns** - Use existing component and API patterns
2. **Test Changes** - Run tests before submitting
3. **Document Updates** - Update relevant documentation
4. **Code Quality** - Follow project coding standards

### Pull Request Process
1. **Create Branch** - Feature branch from main
2. **Make Changes** - Implement feature/fix
3. **Run Tests** - Ensure all tests pass
4. **Update Docs** - Update relevant documentation
5. **Submit PR** - Create pull request with description

## 📈 Performance & Monitoring

### Performance Optimization
- **Frontend**: Code splitting, lazy loading, React.memo()
- **Backend**: Database indexing, query optimization
- **Database**: GIN indexes on JSONB fields
- **Caching**: Strategic caching for frequently accessed data

### Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Application performance monitoring
- **Database**: Supabase performance advisors
- **Logs**: Real-time application and database logs

## 🔗 Links

- **Production**: [FairPlay NIL Platform](https://fairplay-nil.vercel.app)
- **Backend API**: [FastAPI Documentation](https://fairplay-nil-backend.onrender.com/docs)
- **Database**: [Supabase Dashboard](https://supabase.com/dashboard/project/izitucbtlygkzncwmsjl)
- **GitHub**: [Repository](https://github.com/your-org/fairplay-nil)

## 📝 License

This project is proprietary software. All rights reserved.

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
