# Leaders & Contributors Dashboard (Stacks)

A full-featured analytics and activity dashboard built on the **Stacks blockchain**, designed to help project builders, contributors, and ecosystem participants track wallet activity, contributions, and on-chain engagement across Stacks. The application supports modern wallet connectivity, real-time data fetching, and a mobile-first user experience.

---

## 🚀 Overview

The Leaders & Contributors Dashboard is a lightweight, contract-free web application focused on **visibility, transparency, and engagement tracking** on Stacks. It enables users to connect their wallets, monitor activity, and visualize participation metrics using only public blockchain data and secure wallet authentication.

The app runs entirely client-side, requiring **no backend servers or smart contracts**, making it fast, secure, and easy to deploy.

---


## ✨ Key Features

### 🔐 Wallet Connectivity
- Multi-wallet support (Leather + Xverse)
- WalletConnect-style QR and deep-link flows
- Secure, non-custodial authentication
- Automatic wallet detection

### 📊 Activity & Contribution Tracking
- Wallet-based activity monitoring
- Address-level analytics
- Real-time on-chain data via public APIs
- Session-based user state

### 📱 Mobile-First Experience
- Fully responsive UI
- QR modal on desktop
- Deep-link wallet connection on mobile
- Optimized for Chrome & Safari

### 🎨 Modern UI
- Clean, minimal interface
- Built with TailwindCSS
- Fast load times and smooth transitions

### ⚡ No Smart Contracts Required
This project runs entirely on:
- Client-side React
- Public Stacks APIs
- Wallet authentication
- External price/indexer services

---

## 🛠 Tech Stack

- **React + Vite** – Modern front-end tooling
- **TailwindCSS** – Utility-first styling
- **@stacks/connect** – Wallet integration
- **Stacks API** – On-chain activity & balances
- **WalletConnect-style flow** – Mobile + QR support
- **LocalStorage** – Session persistence

---

## 📦 Project Structure

```
leaders-contributors-dashboard/
│── src/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
│── public/
│   ├── icon.png
│   └── index.html
│
│── package.json
└── vite.config.js
```

---

## 🔧 How It Works

1. User opens the dashboard
2. Wallet connect modal is triggered
3. User selects a wallet (desktop or mobile)
4. Wallet address is detected securely
5. Public APIs are queried for activity data
6. Data is aggregated into a clean dashboard view

---

## 🌐 Deployment

This is a fully client-side application and can be deployed on:
- **Vercel**
- **Netlify**
- **GitHub Pages**

No environment variables or backend services are required for basic functionality.

---

## 🔐 WalletConnect Configuration

This project uses a WalletConnect-style authentication flow built on the Stacks Connect SDK, enabling seamless wallet connections across desktop and mobile environments.

### Supported Wallets
- Leather
- Xverse

Both wallets support:
- Desktop browser extensions
- Mobile deep linking
- QR-based connection flows

---

### Required Configuration

#### 1. App Metadata

Your app must expose valid metadata:

```ts
const appConfig = {
  name: "Leaders & Contributors Dashboard",
  icon: "https://your-domain.com/icon.png",
};
```

**Requirements**
- Icon size: **512×512**
- Publicly accessible
- HTTPS only

---

#### 2. Wallet Connection Setup

```ts
import { showConnect } from "@stacks/connect";

showConnect({
  appDetails: appConfig,
  onFinish: ({ userSession }) => {
    // wallet connected
  },
  onCancel: () => {
    // user closed modal
  },
});
```

This flow:
- Displays a multi-wallet selector
- Handles QR codes automatically
- Uses deep links on mobile
- Establishes a secure session

---

#### 3. Network Configuration

```ts
import { StacksMainnet } from "@stacks/network";

const network = new StacksMainnet();
```

Use testnet explicitly for local development when needed.

---

## 📱 Mobile Wallet Troubleshooting

### ❌ Wallet Won’t Connect on Mobile

**Causes**
- App not served over HTTPS
- Missing or invalid app icon
- Unsupported browser

**Fix**
- Deploy with HTTPS
- Ensure `/public/icon.png` loads
- Use Chrome or Safari

---

### ❌ “Couldn’t Connect” Error

**Causes**
- Wallet not installed
- Conflicting wallet providers
- Deprecated APIs

**Fix**
- Avoid `window.web3`
- Do not redefine wallet providers
- Use supported wallet SDKs only

---

### ❌ QR Works on Desktop but Not Mobile

**Expected Behavior**
- Desktop → QR modal
- Mobile → Deep link to wallet app

**Fix**
- Open site in mobile browser
- Install wallet app
- Avoid in-app browsers (Twitter, Telegram)

---

### ❌ No STX Balance or Price Showing

Wallet connection only provides:
- Wallet address
- Authentication session

You must explicitly fetch:
- Balances from Stacks API
- Prices from an external indexer or API

---

### ❌ SSL / Network Errors

Errors like:
```
ERR_SSL_VERSION_OR_CIPHER_MISMATCH
```

**Fix**
- Use a valid SSL certificate
- Avoid mixed HTTP/HTTPS content
- Confirm APIs support HTTPS

---

### Debug Checklist

Before reporting an issue:
- ✅ HTTPS enabled
- ✅ Icon accessible
- ✅ Wallet installed
- ✅ Correct network selected
- ✅ No deprecated provider usage
- ✅ Browser-based testing

---

## 💡 Future Enhancements

- Contribution scoring system
- Address labeling & notes
- Historical analytics views
- Multi-network support
- Exportable activity reports

---

## 📄 License

MIT License  
Free to use, modify, and build upon.

---

Built with ❤️ for the Stacks ecosystem
