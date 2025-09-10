require('dotenv').config();
const mongoose = require('mongoose');
const Group = require('../models/Group');
const Activity = require('../models/Activity');

// Sample groups data
const sampleGroups = [
  {
    name: "Sarah's Medical Recovery Fund",
    description: "Supporting Sarah through her cancer treatment journey. Every contribution helps with medical expenses and daily living costs.",
    contractAddress: "0x1234567890123456789012345678901234567890",
    creator: {
      address: "0x742d35cc6c33c0532c5e5e5e5e5e5e5e5e5e5e5e",
      email: "sarah.recovery@example.com",
      nickname: "Sarah M."
    },
    template: {
      id: "medical-emergency",
      name: "Medical Emergency Fund",
      category: "healthcare"
    },
    settings: {
      privacy: "public",
      maxMembers: 100,
      contributionFrequency: "as-needed",
      minimumContribution: "0.01",
      autoApproveMembers: true
    },
    guidelines: [
      "All funds will be used for verified medical expenses",
      "Monthly updates will be provided on treatment progress",
      "Receipts will be shared with contributors upon request"
    ],
    tags: ["medical", "cancer", "support", "healthcare", "recovery"],
    location: {
      country: "United States",
      region: "California",
      city: "San Francisco"
    },
    social: {
      isPubliclyDiscoverable: true,
      allowMemberInvites: true,
      showMemberList: true,
      showActivityFeed: true
    },
    members: [
      {
        address: "0x742d35cc6c33c0532c5e5e5e5e5e5e5e5e5e5e5e",
        nickname: "Sarah M.",
        role: "admin",
        joinedAt: new Date("2024-01-15"),
        status: "active"
      },
      {
        address: "0x1111111111111111111111111111111111111111",
        nickname: "Mom",
        role: "member",
        joinedAt: new Date("2024-01-16"),
        status: "active"
      },
      {
        address: "0x2222222222222222222222222222222222222222",
        nickname: "Best Friend Emma",
        role: "member",
        joinedAt: new Date("2024-01-20"),
        status: "active"
      }
    ],
    financial: {
      totalBalance: "2.5",
      totalContributions: "5.2",
      totalExpenses: "2.7",
      lastUpdated: new Date()
    },
    stats: {
      memberCount: 3,
      totalTransactions: 8,
      activityScore: 25,
      lastActivityAt: new Date()
    }
  },
  {
    name: "Community Education Fund",
    description: "Pooling resources to provide scholarships and educational support for local students in need.",
    contractAddress: "0x2345678901234567890123456789012345678901",
    creator: {
      address: "0x853f46dc7f77c1c2c4b8a9d2e8f5c6e7d8e9f0a1",
      nickname: "Teacher Mike"
    },
    template: {
      id: "education-fund",
      name: "Education Fund",
      category: "education"
    },
    settings: {
      privacy: "public",
      maxMembers: 50,
      contributionFrequency: "monthly",
      minimumContribution: "0.05",
      autoApproveMembers: false
    },
    guidelines: [
      "Funds are distributed quarterly to verified students",
      "Priority given to students with demonstrated financial need",
      "Academic progress reports required for continued support"
    ],
    tags: ["education", "scholarship", "students", "community", "learning"],
    location: {
      country: "United States",
      region: "Texas",
      city: "Austin"
    },
    members: [
      {
        address: "0x853f46dc7f77c1c2c4b8a9d2e8f5c6e7d8e9f0a1",
        nickname: "Teacher Mike",
        role: "admin",
        joinedAt: new Date("2024-02-01"),
        status: "active"
      },
      {
        address: "0x3333333333333333333333333333333333333333",
        nickname: "Principal Johnson",
        role: "member",
        joinedAt: new Date("2024-02-03"),
        status: "active"
      },
      {
        address: "0x4444444444444444444444444444444444444444",
        nickname: "Parent Council Rep",
        role: "member",
        joinedAt: new Date("2024-02-10"),
        status: "active"
      },
      {
        address: "0x5555555555555555555555555555555555555555",
        nickname: "Local Business Owner",
        role: "member",
        joinedAt: new Date("2024-02-15"),
        status: "active"
      }
    ],
    financial: {
      totalBalance: "8.3",
      totalContributions: "12.1",
      totalExpenses: "3.8",
      lastUpdated: new Date()
    },
    stats: {
      memberCount: 4,
      totalTransactions: 15,
      activityScore: 42,
      lastActivityAt: new Date()
    }
  },
  {
    name: "Neighborhood Emergency Response",
    description: "Rapid response fund for natural disasters and emergencies affecting our local community.",
    contractAddress: "0x3456789012345678901234567890123456789012",
    creator: {
      address: "0x964e57cd8e88d3d3d5c9b0e3f9a6d7e8f9a0b1c2",
      nickname: "Emergency Coordinator Lisa"
    },
    template: {
      id: "emergency-response",
      name: "Emergency Response Fund",
      category: "emergency"
    },
    settings: {
      privacy: "public",
      maxMembers: 200,
      contributionFrequency: "as-needed",
      minimumContribution: "0.02",
      autoApproveMembers: true
    },
    guidelines: [
      "Funds released within 24 hours during verified emergencies",
      "Priority for immediate needs: food, shelter, medical care",
      "Regular drills and preparedness training for members"
    ],
    tags: ["emergency", "disaster-relief", "community", "preparedness", "rapid-response"],
    location: {
      country: "United States",
      region: "Florida",
      city: "Miami"
    },
    members: [
      {
        address: "0x964e57cd8e88d3d3d5c9b0e3f9a6d7e8f9a0b1c2",
        nickname: "Emergency Coordinator Lisa",
        role: "admin",
        joinedAt: new Date("2024-01-01"),
        status: "active"
      },
      {
        address: "0x6666666666666666666666666666666666666666",
        nickname: "Fire Chief Rodriguez",
        role: "member",
        joinedAt: new Date("2024-01-02"),
        status: "active"
      },
      {
        address: "0x7777777777777777777777777777777777777777",
        nickname: "Red Cross Volunteer",
        role: "member",
        joinedAt: new Date("2024-01-05"),
        status: "active"
      }
    ],
    financial: {
      totalBalance: "15.7",
      totalContributions: "22.4",
      totalExpenses: "6.7",
      lastUpdated: new Date()
    },
    stats: {
      memberCount: 3,
      totalTransactions: 12,
      activityScore: 35,
      lastActivityAt: new Date()
    }
  },
  {
    name: "Tech Startup Collective",
    description: "A group of entrepreneurs pooling resources to support each other's startup ventures and shared expenses.",
    contractAddress: "0x4567890123456789012345678901234567890123",
    creator: {
      address: "0xa75f68ed9f99e4e4e6dad3f0b7c8d9e0f1a2b3c4",
      nickname: "Founder Alex"
    },
    template: {
      id: "business-collective",
      name: "Business Collective",
      category: "financial"
    },
    settings: {
      privacy: "private",
      maxMembers: 15,
      contributionFrequency: "monthly",
      minimumContribution: "0.1",
      autoApproveMembers: false
    },
    guidelines: [
      "Monthly pitch sessions for funding requests",
      "Shared co-working space and equipment expenses",
      "Mentorship and skill-sharing among members"
    ],
    tags: ["startup", "entrepreneurship", "technology", "business", "venture"],
    location: {
      country: "United States",
      region: "California",
      city: "San Jose"
    },
    members: [
      {
        address: "0xa75f68ed9f99e4e4e6dad3f0b7c8d9e0f1a2b3c4",
        nickname: "Founder Alex",
        role: "admin",
        joinedAt: new Date("2024-03-01"),
        status: "active"
      },
      {
        address: "0x8888888888888888888888888888888888888888",
        nickname: "Developer Sam",
        role: "member",
        joinedAt: new Date("2024-03-05"),
        status: "active"
      },
      {
        address: "0x9999999999999999999999999999999999999999",
        nickname: "Designer Jordan",
        role: "member",
        joinedAt: new Date("2024-03-10"),
        status: "active"
      }
    ],
    financial: {
      totalBalance: "5.2",
      totalContributions: "7.8",
      totalExpenses: "2.6",
      lastUpdated: new Date()
    },
    stats: {
      memberCount: 3,
      totalTransactions: 6,
      activityScore: 18,
      lastActivityAt: new Date()
    }
  },
  {
    name: "Pet Rescue & Care Fund",
    description: "Supporting local animal rescue efforts and emergency veterinary care for pets in need.",
    contractAddress: "0x5678901234567890123456789012345678901234",
    creator: {
      address: "0xb86079fe0aa3c3d4d7eeb4f1c9dadfe1f2b3c4d5",
      nickname: "Animal Lover Maria"
    },
    template: {
      id: "animal-welfare",
      name: "Animal Welfare Fund",
      category: "lifestyle"
    },
    settings: {
      privacy: "public",
      maxMembers: 75,
      contributionFrequency: "as-needed",
      minimumContribution: "0.01",
      autoApproveMembers: true
    },
    guidelines: [
      "Veterinary receipts required for all medical expense claims",
      "Priority for life-threatening emergency cases",
      "Regular updates with photos and recovery progress"
    ],
    tags: ["animals", "pets", "rescue", "veterinary", "welfare"],
    location: {
      country: "United States",
      region: "Oregon",
      city: "Portland"
    },
    members: [
      {
        address: "0xb86079fe0aa3c3d4d7eeb4f1c9dadfe1f2b3c4d5",
        nickname: "Animal Lover Maria",
        role: "admin",
        joinedAt: new Date("2024-02-15"),
        status: "active"
      },
      {
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        nickname: "Vet Dr. Smith",
        role: "member",
        joinedAt: new Date("2024-02-18"),
        status: "active"
      }
    ],
    financial: {
      totalBalance: "3.1",
      totalContributions: "4.9",
      totalExpenses: "1.8",
      lastUpdated: new Date()
    },
    stats: {
      memberCount: 2,
      totalTransactions: 7,
      activityScore: 14,
      lastActivityAt: new Date()
    }
  }
];

// Sample activities for each group
const generateActivitiesForGroup = (group) => {
  const activities = [];
  const baseTime = new Date(group.createdAt || '2024-01-01');
  
  // Group creation activity
  activities.push({
    id: `activity_${group.contractAddress}_creation`,
    type: 'group_created',
    groupAddress: group.contractAddress,
    groupName: group.name,
    actor: group.creator,
    metadata: {
      description: `Created the ${group.name} group`,
      category: group.template.category,
      tags: group.tags
    },
    privacy: 'public',
    timestamp: baseTime,
    source: 'api'
  });
  
  // Member join activities
  group.members.forEach((member, index) => {
    if (index === 0) return; // Skip creator
    
    activities.push({
      id: `activity_${group.contractAddress}_member_${index}`,
      type: 'member_joined',
      groupAddress: group.contractAddress,
      groupName: group.name,
      actor: {
        address: member.address,
        nickname: member.nickname
      },
      metadata: {
        description: `${member.nickname} joined the group`,
        newMemberCount: index + 1
      },
      privacy: 'members_only',
      timestamp: new Date(member.joinedAt),
      source: 'api'
    });
  });
  
  // Some contribution activities
  for (let i = 0; i < Math.floor(Math.random() * 5) + 2; i++) {
    const member = group.members[Math.floor(Math.random() * group.members.length)];
    const amount = (Math.random() * 0.5 + 0.01).toFixed(4);
    
    activities.push({
      id: `activity_${group.contractAddress}_contribution_${i}`,
      type: 'contribution_made',
      groupAddress: group.contractAddress,
      groupName: group.name,
      actor: {
        address: member.address,
        nickname: member.nickname
      },
      metadata: {
        amount: amount,
        currency: 'ETH',
        description: `Contributed ${amount} ETH to the group fund`,
        txHash: `0x${Math.random().toString(16).substring(2, 66)}`
      },
      privacy: 'members_only',
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random time in last 30 days
      source: 'blockchain'
    });
  }
  
  return activities;
};

// Connect to database and seed
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kindnest');
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Group.deleteMany({});
    await Activity.deleteMany({});
    console.log('🗑️ Cleared existing data');
    
    // Insert sample groups
    const createdGroups = await Group.insertMany(sampleGroups);
    console.log(`📝 Created ${createdGroups.length} sample groups`);
    
    // Generate and insert activities
    const allActivities = [];
    sampleGroups.forEach(group => {
      const activities = generateActivitiesForGroup(group);
      allActivities.push(...activities);
    });
    
    const createdActivities = await Activity.insertMany(allActivities);
    console.log(`📊 Created ${createdActivities.length} sample activities`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\nSample Groups Created:');
    createdGroups.forEach(group => {
      console.log(`  - ${group.name} (${group.template.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('💾 Disconnected from MongoDB');
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { sampleGroups, generateActivitiesForGroup, seedDatabase };