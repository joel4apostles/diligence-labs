# 🔗 Diligence Labs - Blockchain Consultant & Advisory Platform

A modern, secure blockchain consulting platform built with Next.js 15.5.2, featuring comprehensive dashboard functionality, multi-authentication, wallet integration, and advanced admin capabilities.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjoel4apostles%2Fdiligence-labs&project-name=diligence-labs-blockchain-consultant&repository-name=diligence-labs-blockchain-consultant&root-directory=diligencelabs%2Fblockchain-consultant&env=NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,DATABASE_URL&envDescription=Required%20environment%20variables&envLink=https%3A%2F%2Fgithub.com%2Fjoel4apostles%2Fdiligence-labs%2Fblob%2Fmain%2Fdiligencelabs%2Fblockchain-consultant%2F.env.example)

🚀 **Live Demo**: [blockchain-consultant-ad0xtw4e5-joel4apostles-projects.vercel.app](https://blockchain-consultant-ad0xtw4e5-joel4apostles-projects.vercel.app)

## ✨ Latest Features (v0.1.1)

### 🎛️ Enhanced Dashboard System
- **Modern Card-Based UI**: Comprehensive 6-card dashboard with hover effects and animations
- **Real-Time Statistics**: Live dashboard stats API with caching and performance optimization
- **Interactive Elements**: Gradient backgrounds, responsive design, and smooth transitions
- **Smart Navigation**: Quick access cards with proper routing and 404 prevention

### 👤 Advanced User Profile Management
- **Password Management**: Secure password change with strength validation
- **Wallet Integration**: Multi-wallet connection support (MetaMask, WalletConnect, Coinbase)
- **Subscription Controls**: Upgrade plans, usage tracking, and billing management
- **Account Settings**: Name updates, email verification, and privacy controls

### 💼 Subscription & Payment System
- **Tiered Plans**: Basic, Professional, Enterprise, VC, and Ecosystem Partner tiers
- **Stripe Integration**: Secure payment processing and subscription management
- **Usage Tracking**: Credit-based system with automatic renewals
- **Upgrade Flows**: Seamless plan upgrades with prorated billing

### 🛡️ Security & Authentication
- **Multi-Auth System**: Email, OAuth (Google, Twitter, GitHub), and Web3 wallet authentication
- **Enhanced Security**: Rate limiting, CSRF protection, and session management
- **Account Protection**: Failed login monitoring and account lockout prevention
- **Data Encryption**: Client-side field encryption for sensitive information

### 👨‍💼 Admin Dashboard Enhancements
- **Advanced Analytics**: Enhanced admin statistics with caching and performance metrics
- **User Management**: Comprehensive user administration with status controls
- **Notification System**: Admin notification center with email integration
- **Fraud Monitoring**: Real-time fraud detection and prevention alerts
- **Team Management**: Role-based access control and assignment workflows

### 🎨 UI/UX Improvements
- **Modern Design**: Dark theme with orange/red gradient accents
- **Responsive Layout**: Mobile-first design with breakpoint optimization
- **Accessibility**: WCAG compliance with keyboard navigation and screen reader support
- **Performance**: Lazy loading, code splitting, and optimized bundle sizes

## 🏗️ Technical Stack

- **Frontend**: Next.js 15.5.2 with App Router
- **UI Components**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM with SQLite/PostgreSQL support
- **Authentication**: NextAuth.js + Privy for Web3 integration
- **Payments**: Stripe API integration
- **Deployment**: Vercel with automated CI/CD
- **Development**: TypeScript, ESLint, and automated testing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Database (PostgreSQL for production, SQLite for development)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/joel4apostles/diligence-labs.git
cd diligence-labs/diligencelabs/blockchain-consultant
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Initialize the database**:
```bash
npx prisma db push
npx prisma db seed
```

5. **Run the development server**:
```bash
npm run dev
```

6. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
blockchain-consultant/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/          # Admin dashboard routes
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   └── dashboard/      # User dashboard routes
│   ├── components/         # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── subscription/   # Subscription components
│   │   └── ui/             # Shared UI components
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── scripts/                # Build and deployment scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"  # SQLite for development
# DATABASE_URL="postgresql://..."   # PostgreSQL for production

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"  # Update for production

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (optional)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Web3 (optional)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"
```

### Database Setup

For **development** (SQLite):
```bash
npx prisma db push
```

For **production** (PostgreSQL):
```bash
# Update DATABASE_URL in your environment
npx prisma db push
npx prisma generate
```

## 🧪 Testing

### Test Accounts

**Admin Access**:
- Email: `admin@diligence-labs.com`
- Password: `AdminPass123!`
- Admin Key: `ADMIN_2024_SECURE_KEY_001`

**User Testing**:
- Register with any email
- Use social OAuth providers
- Connect Web3 wallets for testing

### Testing Commands

```bash
# Run tests
npm test

# Type checking
npm run build

# Linting
npm run lint
```

## 🚀 Production Deployment

### Vercel Deployment

1. **Connect GitHub repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Configure build settings**:
   - Framework: Next.js
   - Build Command: `npm run build:vercel`
   - Root Directory: `blockchain-consultant`

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel via CLI
npx vercel --prod
```

## 📊 Production Testing Recommendations

### 🥇 Recommended Testing Webhosts

1. **Vercel** (Current deployment)
   - ✅ Best for Next.js applications
   - ✅ Automatic CI/CD from GitHub
   - ✅ Built-in analytics and monitoring
   - ✅ Edge functions and global CDN
   - 💰 Free tier: Generous limits for testing

2. **Railway**
   - ✅ Excellent for full-stack applications
   - ✅ Built-in PostgreSQL database
   - ✅ Simple environment variable management
   - ✅ Automatic SSL certificates
   - 💰 $5/month for hobby plan

3. **Render**
   - ✅ Great for static sites and services
   - ✅ Free tier with good limits
   - ✅ Automatic deploys from GitHub
   - ✅ Built-in database options
   - 💰 Free for static sites, $7/month for services

### 🧪 Testing Workflow Recommendations

1. **Staging Environment**: Use Vercel preview deployments for feature testing
2. **Database**: Set up separate staging database (Neon PostgreSQL free tier)
3. **Environment Variables**: Configure staging-specific values
4. **Load Testing**: Use tools like Artillery or k6 for performance testing
5. **Monitoring**: Set up Vercel Analytics or external monitoring (Uptime Robot)

## 📈 Performance Optimizations

- **Bundle Analysis**: Built-in Next.js analyzer
- **Image Optimization**: Automatic WebP conversion
- **Code Splitting**: Route-based and dynamic imports
- **Caching Strategy**: API responses cached with appropriate headers
- **Database Optimization**: Query optimization with Prisma

## 🛡️ Security Features

- **Authentication**: Multi-provider authentication with session management
- **Authorization**: Role-based access control (RBAC)
- **Data Protection**: Client-side encryption for sensitive fields
- **Rate Limiting**: API endpoint protection
- **CSRF Protection**: Built-in Next.js security features
- **Input Validation**: Zod schema validation on all inputs

## 📚 Documentation

- [Authentication Setup](./docs/AUTHENTICATION.md)
- [Admin Guide](./ADMIN_TESTING_GUIDE.md)
- [Payment Integration](./PAYMENT_TEST_GUIDE.md)
- [Production Deployment](./PRODUCTION_READINESS.md)
- [Security Guide](./ENCRYPTION_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@diligence-labs.com
- 📖 Documentation: [View Docs](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/joel4apostles/diligence-labs/issues)

---

**Built with ❤️ by the Diligence Labs Team**