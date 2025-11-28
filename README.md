# 🌱 KindNest - Support that feels human

*Softly structured. Human, hopeful, and clear. KindNest speaks like a kind, grounded friend who gets things done.*

A warm, community-focused platform where support flows as naturally as love. Built on Base L2 blockchain with transparency, trust, and human connection at its heart.

**Together is easier.** ✨

## 🌟 Features
### 💚 **Human-Centered Support**
- **Create Your Nest**: Start intimate circles of care with the people who matter
- **Share Costs, Share Care**: Transparent contribution tracking where every gesture counts
- **Contribute Kindly**: Support flows naturally when it's needed most—no pressure, just care
- **Together is Easier**: Fair sharing that feels fair, looks fair, and *is* fair
- **Support Anywhere**: Distance doesn't matter when hearts connect across the blockchain
- **Warm & Reassuring**: Every interaction designed with empathy, clarity, and genuine care

### 🎨 **Beautiful, Thoughtful Design**
- **Emerald & Teal Gradients**: Colors that evoke growth, healing, and community
- **Gentle Animations**: Floating effects, warm glows, and interactions that feel alive
- **Human-Centered Loading**: "Finding your nests..." instead of cold progress bars  
- **Glass-Effect UI**: Backdrop blur and soft transparency for a modern, welcoming feel
- **Heart-Based Feedback**: Pulsing hearts replace generic spinners throughout the app

## 💝 **KindNest Brand Philosophy**

KindNest embodies four core personality pillars that guide every design decision:

### 🌿 **Warm & Reassuring**
*"You're not alone in this."* Every interaction feels like a gentle hand on your shoulder, offering comfort and understanding when money matters feel overwhelming.

### 🌟 **Clear & Honest** 
*"Here's exactly what's happening."* We believe transparency builds trust. No hidden fees, no confusing jargon—just clear, honest information presented with care.

### 💪 **Empowering & Inclusive**
*"You've got this, and we've got you."* KindNest gives you the tools and confidence to manage shared expenses while ensuring everyone feels valued and included.

### 🎯 **Humble but Purposeful**
*"Quietly getting things done."* We solve real problems without fanfare, focusing on what matters: making support feel natural and stress-free.

**Design Language**: Soft emerald and teal gradients evoke growth and healing. Gentle animations make interactions feel alive and responsive. Every loading state, button hover, and transition is crafted to feel distinctly human.

## 🏗️ Architecture

### Smart Contracts
- **ExpenseFactory.sol**: Creates and manages support nests
- **GroupTreasury.sol**: Handles contribution tracking, sharing, and settlements
- Built with Solidity ^0.8.20 and OpenZeppelin contracts for maximum security

### Frontend
- **Next.js 15** with React 19 for modern, fast interactions
- **TypeScript** for type safety and developer confidence
- **Tailwind CSS** with custom KindNest design system
- **Reown AppKit** with social logins (Google, Apple, GitHub, Discord) and email authentication
- **wagmi v2** and **Viem** for robust Web3 experiences
- **WalletConnect v2** for seamless wallet connections
- **Human-Centered Animations** with CSS transforms and keyframes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible wallet
- ETH on Base Sepolia Testnet (get from [Base faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd splitwise3-mvp
   ```

2. **Install contract dependencies**
   ```bash
   cd contracts
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Smart Contract Deployment

1. **Configure environment**
   ```bash
   cd contracts
   cp .env.example .env
   # Edit .env with your private key
   ```

2. **Deploy to Base Sepolia**
   ```bash
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

3. **Verify contracts (optional)**
   ```bash
   npx hardhat verify --network baseSepolia <FACTORY_ADDRESS>
   ```

### Frontend Setup

1. **Configure environment**
   ```bash
   cd frontend
   cp .env.example .env.local
   # Update with deployed contract address and WalletConnect project ID
   ```

2. **Update contract address**
   The deployment script automatically updates `frontend/lib/contracts.ts` with the deployed factory address.

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:3000`

## 🌱 How to Use KindNest

### 1. **Connect Your Heart** 💝
- Open KindNest in your browser
- Click the beautiful emerald "Connect Wallet" button
- Ensure you're on Base Sepolia Testnet (Chain ID: 84532)
- *Your digital wallet is now ready to spread kindness*

### 2. **Create Your Nest** 🏡
- Click "Create Your Nest" to start something beautiful
- Give your nest a warm name like "Family Support Circle" or "Friend's Care Fund"
- Choose how others will see you (your caring nickname)
- Confirm with love ✨

### 3. **Invite Someone** 🤗
- Open your cozy nest
- Click "Invite Someone" to grow your circle of care  
- Enter their wallet address and a loving nickname
- *Only nest creators can invite new members - keeping things safe and intimate*

### 4. **Share a Cost** 💚
- Click "Share a Cost" when support is needed
- Describe what you're sharing (like "Sarah's recovery fund" or "Dinner for the group")
- Enter the amount with care and select who should contribute
- Watch as transparency meets compassion

### 5. **See How Care Flows** 📊
- View your nest's caring balance (who's contributed, who needs support)
- Positive balance = others have supported you 💚
- Negative balance = time to show some love back 🌟
- *Every number tells a story of human connection*

### 6. **Contribute Kindly** ✨
- When it's time to support someone, click on the amount with a heart
- Send exactly what's needed - no more, no less
- *Support flows naturally when it feels right*

## 🔧 Configuration

### Network Configuration
- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Environment Variables

#### Contracts (.env)
```bash
PRIVATE_KEY=0x... # Your deployment wallet private key
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=... # For contract verification (get from https://basescan.org/myapikey)
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
NEXT_PUBLIC_EXPLORER_URL=https://sepolia.basescan.org
NEXT_PUBLIC_CARE_CIRCLE_FACTORY=0x... # Deployed factory address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=... # Get from https://cloud.reown.com
```

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npm run test
npm run compile # Compile contracts
```

### Frontend
```bash
cd frontend
npm run build # Test build
npm run type-check # TypeScript checking
npm run lint # ESLint
```

## 📂 Project Structure

```
kindnest-mvp/
├── contracts/                 # Smart contracts for trust & transparency
│   ├── contracts/
│   │   ├── GroupTreasury.sol  # Core support & contribution logic
│   │   └── ExpenseFactory.sol # Nest creation & management
│   ├── scripts/
│   │   └── deploy.js          # Blockchain deployment magic
│   ├── test/                  # Comprehensive security tests
│   └── hardhat.config.js      # Base L2 configuration
├── frontend/                  # KindNest web application
│   ├── app/                   # Next.js app router (pages & layouts)
│   │   ├── page.tsx           # Landing page with hero section
│   │   ├── dashboard/         # Your nests overview
│   │   ├── groups/[id]/       # Individual nest management
│   │   ├── about/             # KindNest story & values
│   │   ├── how-it-works/      # Step-by-step caring guide
│   │   └── globals.css        # KindNest design system & animations
│   ├── components/            # Reusable UI components
│   │   └── ui/                # Button, Input, Card with KindNest styling
│   ├── lib/                   # Web3 hooks, utils, & contract interactions
│   └── types/                 # TypeScript definitions
└── README.md                  # You are here! 🌱
```

## 🔐 Security Considerations

- Contracts use OpenZeppelin's security modules (ReentrancyGuard, Ownable)
- Only group creators can add members
- Debt settlements require exact payment amounts
- All transactions are transparent on-chain

## 🌐 Deployment

### Smart Contracts
Contracts are deployed on Base Sepolia Testnet:
- Explorer: https://sepolia.basescan.org

### Frontend
The frontend can be deployed to any static hosting service:
- Vercel (recommended)
- Netlify
- GitHub Pages

```bash
cd frontend
npm run build
npm run start # Production server
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

- **Base Documentation**: https://docs.base.org/
- **Base Network**: https://base.org/
- **X**: [KindNest X](https://x.com/kindnest_xyz)
- **Issues**: Create an issue in this repository

## 🌱 Growing KindNest

*The future of caring together:*

### 🔮 **Vision for Tomorrow**
- **Telegram Care Bot**: Get gentle reminders and updates where you already chat
- **Receipt Wisdom**: AI-powered scanning to make expense tracking effortless  
- **Global Kindness**: Multi-currency support for worldwide nests of care
- **Pocket-Sized Care**: Native mobile app for support on-the-go
- **Optimized Giving**: Gas optimization to keep more value flowing to where it's needed
- **Caring Insights**: Beautiful analytics that tell stories of human connection

### 🤗 **Join Our Community**
- **Share your story**: How has KindNest helped your community?
- **Suggest with love**: What would make caring even easier?
- **Build together**: Developers welcome to help grow our nest

---

## 💚 **About This Project**

KindNest was born from a simple belief: **technology should make human connection warmer, not colder.**

In a world where sharing expenses often creates awkwardness, KindNest transforms financial transparency into an act of care. Every gradient, every animation, every word is chosen to remind us that behind every wallet address is a human heart.

Built with deep love for the **Base L2 ecosystem** and a conviction that blockchain's greatest power lies not in its technology, but in its ability to help us trust and support each other.

*Together is easier.* 🌱✨

---

**Made with 💚 by humans who believe in humans, for the Base L2 ecosystem**
