// frontend/lib/brand.ts - New brand configuration
export const BRAND_CONFIG = {
  name: "KindNest",
  tagline: "Together is Easier",
  subtitle: "Share costs, share care. Every little helps, adding up to something beautiful.",
  
  // Color theme - warmer, care-focused
  colors: {
    primary: "#4F46E5", // Warm indigo
    secondary: "#EC4899", // Caring pink  
    accent: "#059669", // Trust green
    warning: "#F59E0B", // Warm amber
    background: "#FEFCFB", // Warm white
  },
  
  // Terminology mapping
  terminology: {
    // Old -> New
    "expense": "contribution",
    "split": "share", 
    "debt": "support needed",
    "creditor": "supporter",
    "debtor": "recipient",
    "group": "care circle",
    "member": "circle member",
    "settle": "send support",
    "amount owed": "support to give",
    "amount due": "support to receive"
  },
  
  // Messaging themes
  messaging: {
    hero: {
      title: "Together is Easier",
      subtitle: "Share costs, share care. Every little helps, adding up to something beautiful.",
      cta: "Start Your Care Circle"
    },
    features: [
      "Support that feels human",
      "Care that connects hearts", 
      "Distance doesn't matter",
      "Trust built into every transaction"
    ],
    benefits: [
      "Every contribution is secured by smart contracts",
      "Support flows naturally when it's needed most", 
      "See how small acts add up to something beautiful",
      "Your nest connects hearts across the world"
    ]
  }
}

// Usage examples for consistency
export const COPY_EXAMPLES = {
  buttons: {
    create: "Start Care Circle",
    join: "Join Circle", 
    contribute: "Add Support",
    send: "Send Support",
    view: "View Circle"
  },
  headers: {
    dashboard: "Your Care Circles",
    create: "Start a New Care Circle", 
    contribute: "Add Your Support",
    history: "Support History"
  }
}