'use client';

import { AppKitButton } from '@/components/ui/AppKitButton';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Smartphone,
  Users,
  HandHeart,
  Leaf,
  CheckCircle,
  Plus,
  UserPlus,
  Receipt,
  CreditCard,
  BarChart,
  Shield,
  Zap,
  Globe,
  Mail,
  Heart,
  Sprout
} from 'lucide-react';

export default function HowItWorks() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const steps = [
    {
      step: "01",
      title: "Join with Just Your Email",
      description: "Start your journey of care with simple email authentication. No wallet setup required.",
      icon: Mail,
      color: "from-blue-500 to-indigo-500",
      details: [
        "Enter your email address",
        "Receive instant verification code",
        "Smart wallet created automatically",
        "Ready to give and receive support!"
      ],
      tips: "Your smart wallet is created behind the scenes - no crypto knowledge needed"
    },
    {
      step: "02",
      title: "Create Your Support Circle",
      description: "Build a community of care with a meaningful name and purpose that brings people together",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      details: [
        "Choose a heartwarming circle name",
        "Set your purpose and goals",
        "Customize privacy settings",
        "Smart contract deployed instantly"
      ],
      tips: "Make your circle name meaningful - it helps build emotional connection"
    },
    {
      step: "03",
      title: "Invite Your People",
      description: "Bring in the people who matter most. They can join with just their email too.",
      icon: UserPlus,
      color: "from-green-500 to-emerald-500",
      details: [
        "Share your circle invitation",
        "Members join with email only",
        "Automatic smart wallet setup",
        "Everyone ready to support instantly"
      ],
      tips: "Circle members don't need any crypto experience - email is enough"
    },
    {
      step: "04",
      title: "Share Your Needs",
      description: "Post what you're supporting or requesting help with. Be open about what you need.",
      icon: Receipt,
      color: "from-orange-500 to-red-500",
      details: [
        "Describe what you need support for",
        "Set any contribution goals",
        "Share updates with your circle",
        "Track progress transparently"
      ],
      tips: "The more specific you are, the better your circle can support you"
    },
    {
      step: "05",
      title: "Watch Support Flow",
      description: "See your community come together with real-time support tracking and celebration",
      icon: BarChart,
      color: "from-teal-500 to-cyan-500",
      details: [
        "Monitor support in real-time",
        "Celebrate contributions together",
        "Track community impact",
        "Share gratitude and updates"
      ],
      tips: "Every contribution, no matter the size, makes a difference"
    },
    {
      step: "06",
      title: "Give Back with Love",
      description: "Support others in your circle when you can. One click, zero fees, maximum impact.",
      icon: HandHeart,
      color: "from-violet-500 to-purple-500",
      details: [
        "Support with one simple click",
        "Zero gas fees for all users",
        "Instant delivery to recipients",
        "Permanent record of your kindness"
      ],
      tips: "Every act of support is recorded forever as part of your kindness legacy"
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: "Secure & Transparent",
      description: "All support flows are secured by smart contracts with complete transparency"
    },
    {
      icon: Zap,
      title: "Instant & Gasless",
      description: "Send support immediately with zero transaction fees for all users"
    },
    {
      icon: Globe,
      title: "Globally Accessible",
      description: "Works anywhere in the world with just an email address - no barriers"
    },
    {
      icon: HandHeart,
      title: "Human-Centered",
      description: "Designed for real human needs with empathy and care at every step"
    }
  ];

  const faqs = [
    {
      question: "Do I need cryptocurrency to use KindNest?",
      answer: "No! You can join with just your email. We create a smart wallet for you automatically and handle all the crypto complexity behind the scenes. Support flows are gasless for all users."
    },
    {
      question: "How do gasless transactions work?",
      answer: "We use account abstraction and Gelato relay to cover gas fees for all users. You can send and receive support without ever worrying about transaction costs."
    },
    {
      question: "Can I use KindNest without any crypto knowledge?",
      answer: "Absolutely! KindNest is designed for everyone. Simply sign up with your email and start supporting people. No crypto knowledge required."
    },
    {
      question: "Is my personal information private?",
      answer: "Yes, your personal details stay private. Only your support activities within circles are visible to circle members, creating transparency without compromising privacy."
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
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-800 mb-6">
            <span className="font-black">How We</span> <span className="text-indigo-600 font-black">Care</span>
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8 font-semibold">
            **Creating your nest of support is beautifully simple.** Six gentle steps to start sharing care with email-first access.
          </p>
        </div>

        {/* Step-by-step Guide */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-16">**Step-by-Step Guide**</h2>
          <div className="space-y-16">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}
                >
                  {/* Content */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 backdrop-blur-sm rounded-full px-6 py-3 mb-4 border border-indigo-200 shadow-sm">
                      <span className="text-slate-800 text-sm font-black">STEP {step.step}</span>
                    </div>
                    <h3 className="text-3xl font-black text-black mb-4">{step.title}</h3>
                    <p className="text-xl text-gray-900 mb-6 leading-relaxed font-bold">{step.description}</p>
                    <div className="space-y-3 mb-6">
                      {step.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center space-x-3 justify-center lg:justify-start">
                          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-black font-bold">{detail}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gradient-to-r from-amber-100 to-yellow-100 backdrop-blur-sm rounded-xl p-4 border border-amber-200 shadow-sm">
                      <p className="text-amber-800 text-sm">
                        💡 <strong>Pro Tip:</strong> {step.tips}
                      </p>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className="flex-1 flex justify-center">
                    <div className={`relative w-80 h-80 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                      <Icon className="h-32 w-32 text-white" />
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-gray-800">{step.step}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-16">**Why Care Works Better**</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-black mb-3">{benefit.title}</h3>
                  <p className="text-gray-900 leading-relaxed font-bold">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="py-16">
          <h2 className="text-4xl font-black text-slate-800 text-center mb-16">**Frequently Asked Questions**</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <h3 className="text-xl font-black text-black mb-3">{faq.question}</h3>
                <p className="text-gray-900 leading-relaxed font-bold">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-16 text-center">
          <div className="bg-gradient-to-r from-emerald-100 via-teal-100 to-blue-100 backdrop-blur-lg rounded-3xl p-12 border border-emerald-200 shadow-xl max-w-4xl mx-auto">
            <h2 className="text-4xl font-black text-slate-800 mb-6">**Begin with Kindness**</h2>
            <p className="text-xl text-slate-700 mb-8 max-w-2xl mx-auto font-semibold">
              **You&apos;re not alone in this.** Connect with just your email and create your first nest of support in under 2 minutes.
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