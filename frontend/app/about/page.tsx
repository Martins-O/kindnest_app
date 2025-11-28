'use client';

import { AppKitButton } from '@/components/ui/AppKitButton';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Leaf,
  Target,
  Zap,
  Users,
  Shield,
  Globe,
  Code,
  Trophy,
  Heart,
  Rocket,
  Star,
  Github,
  ExternalLink,
  Award,
  Sprout,
  HandHeart,
  Mail
} from 'lucide-react';

export default function About() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { label: "Support Circles", value: "∞", icon: Users },
    { label: "Acts of Kindness", value: "Growing", icon: Heart },
    { label: "Global Reach", value: "24/7", icon: Globe },
    { label: "Email Access", value: "100%", icon: Mail }
  ];

  const techStack = [
    {
      category: "Frontend",
      technologies: [
        "Next.js 15",
        "React 19",
        "TypeScript",
        "Tailwind CSS",
        "Account Abstraction",
        "Email Authentication"
      ]
    },
    {
      category: "Blockchain",
      technologies: [
        "Solidity ^0.8.20",
        "Hardhat",
        "OpenZeppelin",
        "LISK Sepolia L2",
        "Gelato Relay"
      ]
    },
    {
      category: "Infrastructure",
      technologies: [
        "Smart Wallets",
        "Gasless Transactions",
        "Email OTP System",
        "Layer 2 Scaling",
        "Decentralized Support"
      ]
    }
  ];

  const teamValues = [
    {
      icon: Target,
      title: "Human-First Design",
      description: "Every feature starts with human needs. Technology should serve people, not the other way around."
    },
    {
      icon: Shield,
      title: "Trust Through Transparency",
      description: "Open, verifiable, and secure. Your support flows are protected by smart contracts and community trust."
    },
    {
      icon: Globe,
      title: "Accessible to Everyone",
      description: "No barriers, no gatekeeping. Email access means anyone, anywhere can give and receive support."
    },
    {
      icon: Heart,
      title: "Empathy at Scale",
      description: "Technology that amplifies human kindness and makes supporting each other feel natural and joyful."
    }
  ];

  return (
    <div className="min-h-screen  overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
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
          <AppKitButton />
        </nav>

        {/* Header */}
        <div className={`text-center py-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center bg-gradient-to-r from-amber-100 to-yellow-100 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-amber-200 shadow-sm">
            <Trophy className="h-5 w-5 text-amber-600 mr-2" />
            <span className="text-slate-800 text-sm font-black">Morph Hackathon - Built with ❤️</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-800 mb-6">
            <span className="font-black">About</span> <span className="text-indigo-600 font-black">KindNest</span>
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8 font-semibold">
            **Where support feels human.** Built with blockchain transparency and wrapped in empathy and care.
          </p>
        </div>

        {/* Project Story */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-slate-800 text-center mb-12">**Our Heart & Story**</h2>
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 border border-slate-200 shadow-xl">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-900 text-lg leading-relaxed mb-6 font-bold">
                  **KindNest grew from a simple realization:** supporting each other shouldn&apos;t feel cold or complicated.
                  We saw people struggling with barriers to giving help - complex wallet setups, gas fees, and technical hurdles
                  that made kindness harder than it should be.
                </p>
                <p className="text-gray-900 text-lg leading-relaxed mb-6 font-bold">
                  **Built for the Morph Hackathon,** KindNest combines the transparency of blockchain with the warmth of human connection.
                  We use account abstraction and email authentication to remove every barrier between intention and action.
                  **Every contribution, every act of support, every moment of care** is recorded with the security of
                  smart contracts and the gentleness of community.
                </p>
                <p className="text-gray-900 text-lg leading-relaxed font-bold">
                  **Our mission is beautifully simple:** make supporting each other feel as natural as a warm hug.
                  With just your email address, you can create circles of care that span the globe. **You&apos;re not alone in this.**
                  Together is easier, and every little bit helps.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-12">**Growing Together**</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-black mb-2">{stat.value}</div>
                  <div className="text-gray-900 font-bold">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-12">**Technology Stack**</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {techStack.map((stack, index) => (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-2xl font-black text-black mb-6 text-center">{stack.category}</h3>
                <div className="space-y-3">
                  {stack.technologies.map((tech, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-900 font-bold">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-12">**What We Believe**</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {teamValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4">{value.title}</h3>
                  <p className="text-gray-900 leading-relaxed font-bold">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hackathon Info */}
        <div className="py-16">
          <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 backdrop-blur-lg rounded-3xl p-12 border border-orange-200 shadow-xl text-center">
            <Award className="h-20 w-20 text-amber-600 mx-auto mb-6" />
            <h2 className="text-4xl font-black text-slate-800 mb-6">**Morph Hackathon Project**</h2>
            <p className="text-xl text-gray-900 mb-8 max-w-3xl mx-auto font-bold">
              **KindNest was lovingly built for the Morph Hackathon.** More than just competing for prizes,
              we&apos;re showcasing how blockchain technology can make human connection warmer, not colder.
              **Every line of code written with intention to serve humanity.**
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/90 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl font-black text-black">2025</div>
                <div className="text-gray-900 font-bold">Built with Love</div>
              </div>
              <div className="bg-white/90 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl font-black text-black">L2</div>
                <div className="text-gray-900 font-bold">Blockchain Layer</div>
              </div>
              <div className="bg-white/90 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl font-black text-black">∞</div>
                <div className="text-gray-900 font-bold">Kindness Potential</div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Vision */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Rocket className="h-20 w-20 text-indigo-500 mx-auto mb-8" />
            <h2 className="text-4xl font-black text-slate-800 mb-8">**The Future of Support**</h2>
            <p className="text-xl text-gray-900 leading-relaxed mb-8 font-bold">
              **We believe the future of support is decentralized, transparent, and accessible to everyone.**
              KindNest is just the beginning. We&apos;re building towards a world where support flows as easily
              as love, where trust is built into every interaction, and where caring knows no boundaries.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-black font-black mb-1">Global</div>
                <div className="text-gray-900 font-bold text-sm">No borders to kindness</div>
              </div>
              <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-black font-black mb-1">Secure</div>
                <div className="text-gray-900 font-bold text-sm">Blockchain protected</div>
              </div>
              <div className="bg-white/90 rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-black font-black mb-1">Instant</div>
                <div className="text-gray-900 font-bold text-sm">Real-time support flow</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-blue-100 backdrop-blur-lg rounded-3xl p-12 border border-emerald-200 shadow-xl max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-slate-800 mb-6">**Join the Movement**</h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto font-semibold">
              **Experience the future of support today.** Connect with just your email and start building
              circles of care that span the globe.
            </p>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-1 rounded-2xl inline-block">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl px-8 py-4">
                <AppKitButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}