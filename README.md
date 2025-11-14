# 3D Printing Platform

A full-stack web application for personalizing and ordering 3D printed objects with AI-powered design assistance.

## 🚀 Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email/Password + Google OAuth)
- **Payments**: Stripe
- **3D Rendering**: Three.js, React Three Fiber
- **AI**: OpenAI (GPT-4)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm/yarn
- PostgreSQL 14+
- Git

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd 3DPrinting
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup environment variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/3d_printing_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# OpenAI (optional)
OPENAI_API_KEY="sk-..."
```

### 4. Setup PostgreSQL Database

Create the database:

```bash
# Using psql
createdb 3d_printing_platform

# Or using PostgreSQL CLI
psql -U postgres
CREATE DATABASE 3d_printing_platform;
\q
```

### 5. Run Prisma Migrations

Generate Prisma client and create database schema:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
psql -U postgres -d 3d_printing_platform -f prisma/setup.sql
```

### 6. Start the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio (database GUI)

## 🗂️ Project Structure

```
3DPrinting/
├── components/          # React components
│   └── Navbar.tsx
├── lib/                 # Utility libraries
│   ├── prisma.ts       # Prisma client
│   └── stripe.ts       # Stripe client
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── auth/       # NextAuth endpoints
│   │   └── hello.ts    # Test endpoint
│   ├── _app.tsx        # App wrapper
│   └── index.tsx       # Home page
├── prisma/             # Database schema
│   ├── schema.prisma   # Prisma schema
│   └── setup.sql       # Initial SQL setup
├── public/             # Static files
├── styles/             # Global styles
│   └── globals.css
├── types/              # TypeScript types
├── utils/              # Utility functions
├── .env.example        # Environment variables template
├── next.config.js      # Next.js configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## 🔑 Authentication Setup

### Email/Password Authentication

The platform supports email/password authentication out of the box. Users can sign up and passwords are hashed using bcrypt.

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env`

## 💳 Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the Dashboard
3. Add them to `.env`
4. For webhooks (production):
   - Install Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copy the webhook secret to `.env`

## 🤖 OpenAI Setup (Optional)

1. Create an [OpenAI account](https://platform.openai.com)
2. Generate an API key
3. Add it to `.env` as `OPENAI_API_KEY`

## 📊 Database Management

### View Database with Prisma Studio

```bash
npx prisma studio
```

Opens a GUI at `http://localhost:5555` to browse and edit data.

### Create Database Migration

```bash
npx prisma migrate dev --name migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

⚠️ **Warning**: This will delete all data!

## 🧪 Testing the Setup

1. Visit `http://localhost:3000`
2. Test API: `http://localhost:3000/api/hello`
3. Try signing up with email/password
4. Check database with Prisma Studio

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Docker (Optional)

```bash
# Build
docker build -t 3d-printing-platform .

# Run
docker run -p 3000:3000 3d-printing-platform
```

## 🔒 Security Notes

- Always use strong secrets for `NEXTAUTH_SECRET`
- Never commit `.env` files to version control
- Use environment-specific API keys
- Enable HTTPS in production
- Implement rate limiting for API routes

## 📝 Next Steps

After setup, you can:

1. Create admin user (see `prisma/setup.sql`)
2. Upload 3D models via `/admin/models`
3. Customize models via `/customize/[id]`
4. Test checkout flow with Stripe test cards

## 🐛 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `psql -l`

### Prisma Client Issues

```bash
npx prisma generate
npm run dev
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed as part of the 3D Printing Platform project.

---

**Happy Coding! 🎨🖨️**
