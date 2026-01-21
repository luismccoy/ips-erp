# IPS ERP - Enterprise Resource Planning

A comprehensive ERP solution for Home Care IPS (Instituciones Prestadoras de Salud) in Colombia, built with modern web technologies.

## Features

- **Role-Based Access**: Admin and Nurse portals with distinct functionalities.
- **Rostering**: AI-assisted shift management and nurse routing.
- **Inventory Management**: Real-time stock tracking with thresholds and expiry alerts.
- **Clinical Audit**: Resolution 3100 compliance tracking and risk analysis.
- **Billing**: RIPS validation and Glosa defense using AI suggestions.
- **Family Portal**: Secure access for family members to view patient status.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Vanilla CSS Modules (zero-runtime overhead)
- **Authentication**: AWS Amplify (Cognito)
- **Icons**: Lucide React
- **Analytics**: Custom lightweight hook

## Getting Started

### Prerequisites

- Node.js (v18+)
- AWS Account (for backend features)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-org/ips-erp.git
    cd ips-erp
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment:
    Copy `.env.example` to `.env` and fill in your AWS credentials.
    ```bash
    cp .env.example .env
    ```

4.  Start Development Server:
    ```bash
    npm run dev
    ```

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/         # React Components
│   ├── ui/             # Reusable UI Elements (Button, Card, Input)
│   └── ...             # Dashboard Views (AdminRoster, etc.)
├── config/             # Environment & App Config
├── data/               # Mock Data & Constants
├── hooks/              # Custom Hooks (useAuth, useForm, useAnalytics)
├── types/              # TypeScript Interfaces
└── App.tsx             # Main Entry Point with Lazy Loading
```

## Key Decisions

- **CSS Modules**: Chosen for style isolation and performance over CSS-in-JS libraries.
- **Lazy Loading**: Admin and Nurse dashboards are code-split to improve initial load time.
- **Zero `any`**: The codebase enforces strict type safety.

## License

Private Property of IPS Organization.
