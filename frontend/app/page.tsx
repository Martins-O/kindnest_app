'use client';

import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WalletSelector } from '@/components/auth/WalletSelector';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useAAWalletContext } from '@/components/auth/AAWalletProvider';
import { 
  Heart, 
  Users, 
  Shield, 
  Zap, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Globe,
  CheckCircle,
  Star,
  Wallet,
  Timer,
  HandHeart,
  Leaf
} from 'lucide-react';

export default function Home() {
  const { isConnected } = useAccount();
  const { isAuthenticated } = useSupabaseAuth();
  const { smartAccountAddress } = useAAWalletContext();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    if (isConnected || (isAuthenticated && smartAccountAddress)) {
      router.push('/dashboard');
    }
  }, [isConnected, isAuthenticated, smartAccountAddress, router]);

  // Auto-cycle through features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Create Your Nest",
      description: "Start a support circle with friends, family, or community. No pressure, just care.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Shield,
      title: "Safe & Transparent",
      description: "Every contribution is secured by smart contracts. Trust built into every transaction.", 
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: HandHeart,
      title: "Contribute Kindly",
      description: "Share costs, share care. Support flows naturally when it's needed most.",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: TrendingUp,
      title: "Watch It Grow",
      description: "See how small acts add up. Every contribution makes a difference.",
      color: "from-violet-500 to-purple-500"
    },
    {
      icon: Globe,
      title: "Support Anywhere",
      description: "Distance doesn't matter. Your nest connects hearts across the world.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Timer,
      title: "Always There",
      description: "Support that doesn't forget. Your nest remembers what matters.",
      color: "from-cyan-500 to-blue-500"
    }
  ];

  const benefits = [
    "Support a friend through tough times",
    "Share costs for family gatherings", 
    "Fund community projects together",
    "Help with medical expenses",
    "Support someone's dreams",
    "Share monthly essentials"
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Modern floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-40 w-96 h-96 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-20 left-40 w-96 h-96 bg-gradient-to-r from-teal-400 to-green-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-4 backdrop-blur-md bg-white/10 rounded-3xl px-8 mt-6 shadow-xl border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">KindNest</span>
              <div className="text-xs text-white/70 font-medium">Care Made Simple</div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-white/80">
            <button 
              onClick={() => router.push('/features')}
              className="hover:text-emerald-300 cursor-pointer transition-all duration-200 font-semibold px-4 py-2 rounded-xl hover:bg-white/10"
            >
              Features
            </button>
            <button 
              onClick={() => router.push('/how-it-works')}
              className="hover:text-emerald-300 cursor-pointer transition-all duration-200 font-semibold px-4 py-2 rounded-xl hover:bg-white/10"
            >
              How it Works
            </button>
            <button 
              onClick={() => router.push('/about')}
              className="hover:text-emerald-300 cursor-pointer transition-all duration-200 font-semibold px-4 py-2 rounded-xl hover:bg-white/10"
            >
              About
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className={`py-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-white/20 shadow-lg">
                <Sparkles className="h-5 w-5 text-emerald-300 mr-3 animate-pulse" />
                <span className="text-white font-bold text-sm">Web3 Mutual Aid Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
                <span className="bg-gradient-to-r from-emerald-300 via-green-300 to-teal-300 bg-clip-text text-transparent">
                  Support
                </span>
                <span className="block text-white">
                  Made Simple
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
                Create support circles that matter. Share costs, spread kindness, and 
                <span className="bg-gradient-to-r from-emerald-300 to-green-300 bg-clip-text text-transparent font-bold"> build community</span> together.
              </p>

              {/* Primary CTA with Email First */}
              <div className="flex flex-col items-center gap-6 mb-16">
                <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/50 max-w-lg mx-auto">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Get Started in Seconds</h3>
                    <p className="text-slate-600">Join with email - no wallet required!</p>
                  </div>
                  <WalletSelector />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="font-medium">Zero gas fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="font-medium">Email signup only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="font-medium">Smart wallet created</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-6 border border-emerald-200 shadow-lg">
                  <div className="text-4xl font-black text-emerald-600 mb-2">$0</div>
                  <div className="text-emerald-800 font-semibold">Transaction Fees</div>
                  <div className="text-emerald-600 text-sm mt-1">On LISK testnet</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-6 border border-blue-200 shadow-lg">
                  <div className="text-4xl font-black text-blue-600 mb-2">∞</div>
                  <div className="text-blue-800 font-semibold">Group Members</div>
                  <div className="text-blue-600 text-sm mt-1">No limits on care</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-3xl p-6 border border-purple-200 shadow-lg">
                  <div className="text-4xl font-black text-purple-600 mb-2 animate-pulse">24/7</div>
                  <div className="text-purple-800 font-semibold">Always Available</div>
                  <div className="text-purple-600 text-sm mt-1">Support when needed</div>
                </div>
              </div>
            </div>

            {/* Interactive Feature Preview */}
            <div className="bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-white/50 max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Why Choose KindNest?</h2>
                <p className="text-slate-600 text-lg">Discover what makes support feel human</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-4 py-2">
                    <span className="text-indigo-700 text-sm font-bold">Featured: {features[activeFeature].title}</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-800">{features[activeFeature].title}</h3>
                  <p className="text-slate-600 text-xl leading-relaxed">{features[activeFeature].description}</p>
                  
                  <button 
                    onClick={() => router.push('/how-it-works')}
                    className="inline-flex items-center space-x-3 text-indigo-600 hover:text-indigo-700 transition-all group bg-indigo-50 hover:bg-indigo-100 rounded-2xl px-6 py-3 font-semibold"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
                
                <div className={`relative w-full h-80 bg-gradient-to-br ${features[activeFeature].color} rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden`}>
                  {(() => {
                    const Icon = features[activeFeature].icon;
                    return <Icon className="h-32 w-32 text-white/90 animate-pulse" />;
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
                </div>
              </div>
              
              {/* Feature indicators */}
              <div className="flex justify-center mt-8 space-x-3">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`h-4 rounded-full transition-all duration-300 ${
                      index === activeFeature ? 'bg-indigo-500 w-12' : 'bg-slate-300 hover:bg-slate-400 w-4'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Everything You Need to</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Share Care</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Built for real people who want to support each other without complexity
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`group relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} shadow-lg`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Use Cases */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Real Stories,</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Real Support</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Every situation where care matters most</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-indigo-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-slate-700 font-semibold leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Get Started in</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">3 Simple Steps</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">No complex setup, no technical knowledge needed</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Sign Up with Email",
                description: "Enter your email and get a smart wallet instantly - no downloads needed",
                icon: Sparkles,
                color: "from-blue-500 to-indigo-500"
              },
              {
                step: "02", 
                title: "Create Your Circle",
                description: "Start a support group and invite people who matter to you",
                icon: Users,
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "03",
                title: "Share & Care",
                description: "Contribute when you can, receive support when you need it",
                icon: HandHeart,
                color: "from-emerald-500 to-teal-500"
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-slate-200 hover:border-indigo-300 transition-all duration-300 hover:scale-[1.02]">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full px-4 py-2 text-sm font-bold text-indigo-700 mb-4">{step.step}</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block absolute top-12 -right-4 h-6 w-6 text-indigo-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20">
          <div className=" rounded-3xl p-12 mx-auto shadow-2xl max-w-5xl text-center text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8">
                <Heart className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-black mb-6">
                Ready to Start Your
                <span className="block">Support Circle?</span>
              </h2>
              
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join thousands who&apos;ve discovered that caring for each other 
                is easier when we do it together.
              </p>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto mb-8">
                <WalletSelector />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-white/80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>No wallet needed to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Zero transaction fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Setup in under 60 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="py-12">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-8 border border-slate-200 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-4 mb-6 md:mb-0">
                <div className="w-14 h-14  rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">KindNest</span>
                  <div className="text-xs text-slate-500 font-medium">Care Made Simple</div>
                </div>
              </div>
              <div className="text-slate-600 text-center md:text-right">
                <p className="mb-2 font-semibold">Built for Aleph Hackathon 2024</p>
                <p className="text-sm text-slate-500">LISK & Web3Bridge Partnership</p>
                <p className="text-xs text-slate-400 mt-2">*Testnet gas fees sponsored by Gelato</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
