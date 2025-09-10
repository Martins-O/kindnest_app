'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp, 
  Globe, 
  Timer,
  Leaf,
  CheckCircle,
  Wallet,
  HandHeart,
  Receipt,
  BarChart,
  Lock,
  Smartphone,
  Cloud,
  Heart,
  Sprout
} from 'lucide-react';

export default function Features() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const mainFeatures = [
    {
      icon: Users,
      title: "Create Your Support Circle",
      description: "Build communities of care with email-first access. No wallet needed to start helping each other.",
      details: [
        "Email authentication for easy access",
        "Smart wallet creation included",
        "Gasless transactions for all users",
        "Real-time support tracking"
      ],
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Shield,
      title: "Account Abstraction Magic",
      description: "Experience gasless transactions with smart accounts. Send support without worrying about gas fees.",
      details: [
        "Smart contract wallets for everyone",
        "Gasless transactions via Gelato",
        "Automatic deployment and setup",
        "Secure by design"
      ],
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Zap,
      title: "Instant Kindness",
      description: "Send support instantly with one click. No complex processes, just pure human connection.",
      details: [
        "One-click support sending",
        "Zero gas fees for users",
        "Instant transaction confirmations",
        "Real-time balance updates"
      ],
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Community Support Tracking",
      description: "Watch your support network grow with transparent tracking and beautiful visualizations.",
      details: [
        "Track contributions and support given",
        "Visualize community impact",
        "Member activity timeline",
        "Support balance insights"
      ],
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Global Kindness Network",
      description: "Connect with supporters worldwide. Email-first design means anyone can join your circle of care.",
      details: [
        "Email authentication - no barriers",
        "Global accessibility via blockchain",
        "Cross-border support flows",
        "Multi-language community ready"
      ],
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Timer,
      title: "Always Remember the Good",
      description: "Every act of kindness is permanently recorded. Support histories that celebrate human connection.",
      details: [
        "Permanent support records",
        "Beautiful giving histories",
        "Transparent kindness tracking",
        "Celebration of community impact"
      ],
      color: "from-pink-500 to-rose-500"
    }
  ];

  const technicalFeatures = [
    {
      icon: Wallet,
      title: "Smart Account Creation",
      description: "Automatic smart wallet deployment with gasless transactions for every user"
    },
    {
      icon: HandHeart,
      title: "Email-First Access",
      description: "Join support circles with just your email - no crypto knowledge required"
    },
    {
      icon: Receipt,
      title: "Support Transparency",
      description: "Every contribution is recorded on-chain with full transparency and trust"
    },
    {
      icon: BarChart,
      title: "Community Dashboard",
      description: "Beautiful insights into your support network and community impact"
    },
    {
      icon: Lock,
      title: "Privacy by Design",
      description: "Your personal data stays private while support flows remain transparent"
    },
    {
      icon: Cloud,
      title: "Decentralized Care",
      description: "No central authority - your support circles are controlled by the community"
    }
  ];

  return (
    <div className="min-h-screen  overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors font-semibold"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800">KindNest</span>
            </div>
          </div>
          <ConnectButton />
        </nav>

        {/* Header */}
        <div className={`text-center py-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-800 mb-6">
            <span className="font-black">Every Kindness</span> <span className="text-indigo-600 font-black">Matters</span>
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8 font-semibold">
            **Discover what makes KindNest the warmest way to support each other.** Every feature designed with empathy, care, and human connection at heart.
          </p>
        </div>

        {/* Main Features */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-16">**Core Features**</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {mainFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`bg-white/95 backdrop-blur-lg rounded-3xl p-8 border border-slate-200 shadow-xl hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 hover:scale-105 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4">{feature.title}</h3>
                  <p className="text-gray-900 text-lg mb-6 leading-relaxed font-bold">{feature.description}</p>
                  <div className="space-y-3">
                    {feature.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-black font-bold">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Features */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-16">**Technical Capabilities**</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {technicalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg hover:border-indigo-300 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-black mb-3">{feature.title}</h3>
                  <p className="text-gray-900 leading-relaxed font-bold">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why Choose SplitWise */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 backdrop-blur-lg rounded-3xl p-12 border border-slate-200 shadow-xl">
            <h2 className="text-4xl font-black text-slate-800 text-center mb-8">**Why Choose KindNest?**</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">**Traditional Support**</h3>
                <div className="space-y-3">
                  {[
                    "Complex setup processes",
                    "High barriers to entry", 
                    "Expensive transaction fees",
                    "Limited accessibility",
                    "Centralized control systems"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-black font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 mb-4">**KindNest**</h3>
                <div className="space-y-3">
                  {[
                    "Email-first, no barriers",
                    "Gasless for all users",
                    "Smart account automation", 
                    "Global kindness network",
                    "Human-centered design"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                      <span className="text-black font-bold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <h2 className="text-4xl font-black text-slate-800 mb-6">**Ready to Start Caring?**</h2>
          <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto font-semibold">
            **Join our growing community** of people supporting each other with kindness and transparency
          </p>
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1 rounded-2xl inline-block">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-8 py-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}