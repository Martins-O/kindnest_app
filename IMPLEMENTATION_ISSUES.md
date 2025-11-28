# KindNest - Reown AppKit & WalletConnect UI Implementation Issues

## Overview
This document tracks the implementation and upgrade tasks for integrating Reown AppKit and WalletConnect UI into the KindNest project. All tasks focus on enhancing existing features without adding new functionality.

---

## Issue #1: Enhanced Reown AppKit Web Components Integration

### Description
Replace legacy `w3m-button` components with modern Reown AppKit web components across all pages. Implement custom-styled AppKit buttons that match KindNest's brand identity (emerald/teal gradients).

### Tasks
- [ ] Replace all `w3m-button` instances with `appkit-button` components
- [ ] Create custom AppKit button wrapper component with KindNest styling
- [ ] Implement `appkit-network-button` for chain switching
- [ ] Add `appkit-account-button` for account management
- [ ] Apply consistent theming across all AppKit components
- [ ] Ensure proper SSR compatibility for Next.js 15

### Files to Modify
- `frontend/components/ui/AppKitButton.tsx` (NEW)
- `frontend/app/dashboard/page.tsx`
- `frontend/app/features/page.tsx`
- `frontend/app/how-it-works/page.tsx`
- `frontend/app/about/page.tsx`
- `frontend/app/page.tsx`
- `frontend/app/globals.css`

### Acceptance Criteria
- All legacy wallet connect buttons replaced
- Custom styling maintains KindNest brand consistency
- Components work in both wallet and email authentication modes
- No hydration errors in Next.js SSR

---

## Issue #2: Advanced AppKit Configuration and Modal Customization

### Description
Enhance the AppKit provider configuration to leverage advanced features including custom modals, improved social login integration, and optimized network handling for Base chains.

### Tasks
- [ ] Update AppKit modal configuration with custom theming
- [ ] Implement all available social login providers (Google, GitHub, Apple, Discord, X/Twitter, Facebook)
- [ ] Configure custom wallet list with prioritized Base-compatible wallets
- [ ] Add email wallet display preferences
- [ ] Implement custom modal views for connection states
- [ ] Configure proper SIWE (Sign-In with Ethereum) support
- [ ] Add connection error handling and retry logic

### Files to Modify
- `frontend/app/providers.tsx`
- `frontend/lib/wagmi.ts`
- `frontend/lib/appkit-config.ts` (NEW)
- `frontend/types/appkit.ts` (NEW)

### Acceptance Criteria
- Modal displays with custom KindNest branding
- All social login options functional
- Base Sepolia and Base Mainnet properly configured
- Email authentication seamlessly integrated
- Proper error states and loading indicators

---

## Issue #3: Optimized Reown AppKit Hooks and State Management

### Description
Implement comprehensive Reown AppKit React hooks throughout the application to replace direct wagmi calls where appropriate. Create custom composite hooks for common wallet operations.

### Tasks
- [ ] Implement `useAppKitAccount` for account management
- [ ] Add `useAppKitNetwork` for network switching
- [ ] Create `useAppKitState` for modal state management
- [ ] Implement `useAppKitEvents` for connection event handling
- [ ] Create composite hook `useKindNestWallet` combining AppKit hooks
- [ ] Add proper TypeScript types for all hooks
- [ ] Implement hooks for disconnect, connection status tracking
- [ ] Add hooks for wallet balance and transaction history

### Files to Modify
- `frontend/hooks/useKindNestWallet.ts` (NEW)
- `frontend/hooks/useAppKitIntegration.ts` (NEW)
- `frontend/app/dashboard/page.tsx`
- `frontend/components/auth/WalletSelector.tsx`
- `frontend/components/GroupWallet.tsx`
- `frontend/components/SmartWallet.tsx`

### Acceptance Criteria
- All AppKit hooks properly implemented
- Type safety maintained throughout
- No duplicate code between wagmi and AppKit
- Performance optimized with proper memoization
- Seamless wallet and email user experience

---

## Issue #4: WalletConnect UI Components Library

### Description
Create a comprehensive library of reusable WalletConnect UI components styled for KindNest. Implement wallet connection flows, network switching UI, and transaction confirmation modals.

### Tasks
- [ ] Create `WalletConnectButton` component with KindNest styling
- [ ] Implement `NetworkSwitcher` component for Base chain management
- [ ] Build `AccountModal` component for account details
- [ ] Create `TransactionConfirmation` modal component  
- [ ] Implement `WalletConnectionFlow` guided component
- [ ] Add `DisconnectButton` with confirmation dialog
- [ ] Create `ChainChecker` component for network validation
- [ ] Build `WalletBalanceDisplay` component
- [ ] Implement proper loading and error states for all components
- [ ] Add accessibility features (ARIA labels, keyboard navigation)

### Files to Modify
- `frontend/components/wallet-connect/WalletConnectButton.tsx` (NEW)
- `frontend/components/wallet-connect/NetworkSwitcher.tsx` (NEW)
- `frontend/components/wallet-connect/AccountModal.tsx` (NEW)
- `frontend/components/wallet-connect/TransactionConfirmation.tsx` (NEW)
- `frontend/components/wallet-connect/WalletConnectionFlow.tsx` (NEW)
- `frontend/components/wallet-connect/DisconnectButton.tsx` (NEW)
- `frontend/components/wallet-connect/ChainChecker.tsx` (NEW)
- `frontend/components/wallet-connect/WalletBalanceDisplay.tsx` (NEW)
- `frontend/components/wallet-connect/index.ts` (NEW)
- `frontend/app/globals.css`

### Acceptance Criteria
- All components follow KindNest design system
- Components are reusable across the application
- Proper TypeScript interfaces defined
- Comprehensive error handling
- Smooth animations and transitions
- Mobile-responsive design
- Accessibility standards met (WCAG 2.1 AA)

---

## Implementation Strategy

### Branch Structure
1. **Branch 1**: `feature/enhanced-appkit-components` (Issue #1)
2. **Branch 2**: `feature/appkit-advanced-config` (Issue #2)
3. **Branch 3**: `feature/appkit-hooks-optimization` (Issue #3)
4. **Branch 4**: `feature/walletconnect-ui-library` (Issue #4)

### Commit Message Template
```
<type>: <short description>

<detailed description of changes>

- Specific change 1
- Specific change 2
- Specific change 3

Implementation details:
<technical details>

Testing:
<how it was tested>
```

### Types
- `feat`: New feature or enhancement
- `refactor`: Code refactoring without behavior change
- `style`: Styling changes
- `fix`: Bug fixes
- `perf`: Performance improvements
- `types`: TypeScript type definitions

---

## Testing Checklist

For each implementation:
- [ ] Component renders correctly in development
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Works with wallet connection
- [ ] Works with email authentication
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] No console errors or warnings
- [ ] Proper loading states
- [ ] Error handling works correctly

---

## Notes
- All implementations must maintain backward compatibility
- Focus on Base Sepolia testnet for development
- Ensure proper gas optimization
- Follow KindNest brand guidelines (emerald/teal gradients)
- Maintain warm, human-centered UX copy
- No AI tools or processes should be mentioned in commits or PRs
