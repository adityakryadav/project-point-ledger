# ILPEP - Indian Loyalty Points Exchange Platform

A production-ready, modern fintech web application frontend for an RBI-regulated AI-driven platform that allows users to aggregate, exchange, and liquidate loyalty points.

## 🎨 Design

- **Theme**: Dark mode with glassmorphism effects
- **Colors**: Deep navy (#0B1C2D) background with electric blue (#00D9FF) and teal (#00FFD1) accents
- **Typography**: Inter font family
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization

## 🚀 Features

### User Features
- **Landing Page**: Hero section with animated dashboard preview
- **Authentication**: OTP login, PAN verification, Aadhaar XML upload, Video KYC
- **User Dashboard**: Wallet overview, program distribution charts, transaction history
- **Loyalty Aggregation**: Connect bank/airline/merchant accounts, real-time balance sync
- **Exchange Flow**: Dynamic AI exchange rate calculator with GST breakdown
- **Ledger & Transactions**: Double-entry bookkeeping view with GST components
- **Fraud Detection**: Real-time fraud scoring with risk indicators

### Admin Features
- **Compliance Dashboard**: STR reports, monthly transaction alerts, smurfing detection
- **Pricing Engine**: DQN multiplier controls, revenue vs inventory charts, time-based pricing
- **System Analytics**: TPS monitoring, API latency, cache hit ratio, model drift indicators

## 📁 Project Structure

```
ledger/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Landing page
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── aggregation/       # Loyalty aggregation
│   ├── exchange/          # Exchange flow
│   ├── ledger/            # Transaction ledger
│   ├── fraud/             # Fraud detection
│   ├── compliance/        # Compliance dashboard
│   ├── pricing/           # Pricing engine
│   └── analytics/         # System analytics
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ProgressBar.tsx
│   ├── pages/             # Page components
│   └── layout/            # Layout components
├── lib/
│   └── utils.ts           # Utility functions
└── public/                # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🎯 Key Pages

- `/` - Landing page
- `/auth` - Authentication & KYC
- `/dashboard` - User dashboard
- `/aggregation` - Loyalty aggregation
- `/exchange` - Exchange flow
- `/ledger` - Transaction ledger
- `/fraud` - Fraud detection
- `/compliance` - Compliance dashboard (Admin)
- `/pricing` - Pricing engine (Admin)
- `/analytics` - System analytics (Admin)

## 🎨 Design System

### Colors
- Primary: Deep navy (#0B1C2D)
- Accent Electric: #00D9FF
- Accent Neon: #00FFD1
- Teal: Various shades for secondary elements

### Components
All components follow a consistent design pattern:
- Glassmorphism effects with backdrop blur
- Smooth hover animations
- Gradient text for highlights
- Badge system for status indicators
- Progress bars for metrics

## 📝 Notes

- This is a frontend-only implementation
- All API calls are simulated with dummy data
- No backend integration included
- Designed for demonstration and portfolio purposes

## 🔒 Compliance Features

- GST breakdown (CGST/SGST/IGST)
- FIU-IND reporting interface
- STR (Suspicious Transaction Report) generation
- KYC level tracking (Small PPI / Full KYC)
- Monthly transaction monitoring

## 🤖 AI Features

- DQN reinforcement learning pricing engine
- XGBoost fraud detection model
- Real-time risk scoring
- Model drift monitoring
- Collaborative filtering recommendations

---

Built with ❤️ for ILPEP
