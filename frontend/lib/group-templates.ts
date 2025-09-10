'use client';

import { 
  Heart, 
  GraduationCap, 
  Shield, 
  Users, 
  Home,
  Car,
  Baby,
  Briefcase,
  Plane,
  Gift
} from 'lucide-react';

export interface GroupTemplate {
  id: string;
  name: string;
  description: string;
  icon: any; // Lucide icon component
  color: string;
  category: 'healthcare' | 'education' | 'emergency' | 'lifestyle' | 'financial';
  suggestedInitialAmount: string; // in ETH
  suggestedContributionFrequency: 'weekly' | 'monthly' | 'quarterly' | 'one-time';
  defaultGuidelines: string[];
  suggestedExpenseCategories: string[];
  estimatedMemberCount: {
    min: number;
    max: number;
  };
  privacy: 'public' | 'private';
  tags: string[];
}

export const GROUP_TEMPLATES: GroupTemplate[] = [
  // Healthcare Templates
  {
    id: 'medical-emergency',
    name: 'Medical Emergency Fund',
    description: 'A collective fund to help members with unexpected medical expenses, hospital bills, and emergency treatments.',
    icon: Heart,
    color: 'bg-gradient-to-br from-red-500 to-pink-600',
    category: 'healthcare',
    suggestedInitialAmount: '0.1',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Members contribute monthly to build emergency reserves',
      'Fund supports urgent medical expenses over $500',
      'Requires medical documentation for claims',
      'Priority given to life-threatening situations',
      'Maximum claim of 50% of fund balance per member per year'
    ],
    suggestedExpenseCategories: [
      'Emergency surgery',
      'Hospital bills',
      'Prescription medications',
      'Medical equipment',
      'Ambulance services',
      'Specialist consultations'
    ],
    estimatedMemberCount: { min: 10, max: 50 },
    privacy: 'private',
    tags: ['health', 'emergency', 'medical', 'insurance']
  },
  {
    id: 'dental-care',
    name: 'Dental Care Fund',
    description: 'Collaborative fund for dental treatments, orthodontics, and oral health maintenance.',
    icon: Heart,
    color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    category: 'healthcare',
    suggestedInitialAmount: '0.05',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Regular contributions for preventive and restorative dental care',
      'Covers routine cleanings, fillings, and major procedures',
      'Members can claim up to their contribution amount annually',
      'Emergency dental work gets priority'
    ],
    suggestedExpenseCategories: [
      'Dental cleanings',
      'Fillings and crowns',
      'Orthodontics',
      'Wisdom teeth removal',
      'Emergency dental work'
    ],
    estimatedMemberCount: { min: 5, max: 25 },
    privacy: 'private',
    tags: ['dental', 'health', 'preventive', 'routine']
  },

  // Education Templates
  {
    id: 'education-fund',
    name: 'Education Support Fund',
    description: 'Support members and their families with educational expenses including tuition, books, and learning materials.',
    icon: GraduationCap,
    color: 'bg-gradient-to-br from-green-500 to-emerald-600',
    category: 'education',
    suggestedInitialAmount: '0.2',
    suggestedContributionFrequency: 'quarterly',
    defaultGuidelines: [
      'Fund supports tuition, books, and educational materials',
      'Priority for K-12 and higher education expenses',
      'Members can apply for education loans from the fund',
      'Scholarship program for exceptional academic achievement',
      'Professional development and certification courses eligible'
    ],
    suggestedExpenseCategories: [
      'Tuition fees',
      'Textbooks and materials',
      'Educational technology',
      'Certification courses',
      'Student transportation',
      'School supplies'
    ],
    estimatedMemberCount: { min: 8, max: 40 },
    privacy: 'public',
    tags: ['education', 'learning', 'tuition', 'scholarships', 'development']
  },
  {
    id: 'skill-development',
    name: 'Professional Skills Fund',
    description: 'Collective investment in member skill development, certifications, and career advancement.',
    icon: Briefcase,
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    category: 'education',
    suggestedInitialAmount: '0.15',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Support for professional certifications and courses',
      'Conference attendance and networking events',
      'Skills training and workshops',
      'Career transition support'
    ],
    suggestedExpenseCategories: [
      'Professional certifications',
      'Online courses',
      'Conference tickets',
      'Training workshops',
      'Career coaching'
    ],
    estimatedMemberCount: { min: 6, max: 30 },
    privacy: 'public',
    tags: ['skills', 'professional', 'career', 'certifications']
  },

  // Emergency Response Templates
  {
    id: 'emergency-response',
    name: 'Community Emergency Response',
    description: 'Rapid response fund for natural disasters, family emergencies, and urgent community needs.',
    icon: Shield,
    color: 'bg-gradient-to-br from-orange-500 to-red-600',
    category: 'emergency',
    suggestedInitialAmount: '0.3',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Immediate assistance for natural disasters and emergencies',
      'No waiting period for urgent situations',
      'Community-wide support during crises',
      'Temporary housing and basic needs covered',
      'Coordinated response with local emergency services'
    ],
    suggestedExpenseCategories: [
      'Disaster relief supplies',
      'Temporary housing',
      'Emergency transportation',
      'Food and water',
      'Medical emergency aid',
      'Property damage assistance'
    ],
    estimatedMemberCount: { min: 15, max: 100 },
    privacy: 'public',
    tags: ['emergency', 'disaster', 'community', 'relief', 'crisis']
  },
  {
    id: 'family-crisis',
    name: 'Family Crisis Support',
    description: 'Support network for families facing unexpected crises, job loss, or major life changes.',
    icon: Home,
    color: 'bg-gradient-to-br from-teal-500 to-blue-600',
    category: 'emergency',
    suggestedInitialAmount: '0.1',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Support for job loss and income disruption',
      'Family emergency situations',
      'Temporary financial assistance',
      'Connects families with community resources'
    ],
    suggestedExpenseCategories: [
      'Rent and utilities',
      'Groceries and essentials',
      'Job search support',
      'Childcare assistance',
      'Transportation costs'
    ],
    estimatedMemberCount: { min: 8, max: 35 },
    privacy: 'private',
    tags: ['family', 'crisis', 'support', 'jobless', 'assistance']
  },

  // Lifestyle Templates
  {
    id: 'travel-fund',
    name: 'Group Travel Fund',
    description: 'Collective savings for group trips, vacations, and travel experiences.',
    icon: Plane,
    color: 'bg-gradient-to-br from-sky-500 to-blue-600',
    category: 'lifestyle',
    suggestedInitialAmount: '0.05',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Members save together for group travel experiences',
      'Democratic voting on destinations and dates',
      'Shared accommodation and group discounts',
      'Optional individual trip support'
    ],
    suggestedExpenseCategories: [
      'Flight tickets',
      'Accommodation',
      'Transportation',
      'Activities and tours',
      'Travel insurance',
      'Group meals'
    ],
    estimatedMemberCount: { min: 4, max: 20 },
    privacy: 'private',
    tags: ['travel', 'vacation', 'group', 'savings', 'experiences']
  },
  {
    id: 'celebration-fund',
    name: 'Celebration & Events Fund',
    description: 'Fund for birthdays, weddings, graduations, and special life celebrations.',
    icon: Gift,
    color: 'bg-gradient-to-br from-pink-500 to-rose-600',
    category: 'lifestyle',
    suggestedInitialAmount: '0.03',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Celebrate member milestones and achievements',
      'Group gifts for special occasions',
      'Event planning and coordination',
      'Surprise celebrations and gatherings'
    ],
    suggestedExpenseCategories: [
      'Birthday celebrations',
      'Wedding gifts',
      'Graduation parties',
      'Holiday gatherings',
      'Achievement rewards'
    ],
    estimatedMemberCount: { min: 5, max: 30 },
    privacy: 'private',
    tags: ['celebrations', 'gifts', 'events', 'milestones', 'social']
  },

  // Financial Templates
  {
    id: 'home-fund',
    name: 'Home Purchase Fund',
    description: 'Collective savings to help members achieve homeownership goals.',
    icon: Home,
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    category: 'financial',
    suggestedInitialAmount: '0.5',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Long-term savings for down payments',
      'Home buying education and resources',
      'Group negotiating power with lenders',
      'Support for first-time home buyers'
    ],
    suggestedExpenseCategories: [
      'Down payment assistance',
      'Closing costs',
      'Home inspection fees',
      'Moving expenses',
      'Home improvement loans'
    ],
    estimatedMemberCount: { min: 6, max: 25 },
    privacy: 'private',
    tags: ['homeownership', 'savings', 'mortgage', 'investment']
  },
  {
    id: 'vehicle-fund',
    name: 'Vehicle Purchase & Maintenance',
    description: 'Shared fund for vehicle purchases, maintenance, and emergency repairs.',
    icon: Car,
    color: 'bg-gradient-to-br from-slate-500 to-gray-600',
    category: 'financial',
    suggestedInitialAmount: '0.08',
    suggestedContributionFrequency: 'monthly',
    defaultGuidelines: [
      'Vehicle purchase assistance for members',
      'Emergency repair fund',
      'Routine maintenance support',
      'Group discounts with local mechanics'
    ],
    suggestedExpenseCategories: [
      'Vehicle down payments',
      'Emergency repairs',
      'Routine maintenance',
      'Insurance deductibles',
      'Registration fees'
    ],
    estimatedMemberCount: { min: 8, max: 40 },
    privacy: 'private',
    tags: ['vehicle', 'car', 'maintenance', 'transportation']
  }
];

export const getTemplatesByCategory = (category: string) => {
  return GROUP_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return GROUP_TEMPLATES.find(template => template.id === id);
};

export const getPopularTemplates = (limit: number = 6) => {
  // Return most commonly used templates
  return GROUP_TEMPLATES.slice(0, limit);
};

export const searchTemplates = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return GROUP_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};