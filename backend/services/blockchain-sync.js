const { ethers } = require('ethers');
const Group = require('../models/Group');
const Activity = require('../models/Activity');

// Contract ABIs and addresses
const EXPENSE_FACTORY_ABI = [
  "event GroupCreated(address indexed group, address indexed creator, string name, uint256 timestamp)",
  "event GroupDeactivated(address indexed group, uint256 timestamp)",
  "function getGroupInfo(address _groupAddress) external view returns (tuple(address groupAddress, string name, address creator, uint256 createdAt, bool active))",
  "function getAllGroups() external view returns (address[] memory)"
];

const GROUP_TREASURY_ABI = [
  "event MemberAdded(address indexed member, string nickname, uint256 timestamp)",
  "event MemberRemoved(address indexed member, uint256 timestamp)", 
  "event ExpenseAdded(uint256 indexed expenseId, address indexed paidBy, uint256 amount, string description)",
  "event DebtSettled(address indexed debtor, address indexed creditor, uint256 amount, uint256 settlementId)",
  "event ETHReceived(address indexed sender, uint256 amount, uint256 timestamp)",
  "function getGroupStats() external view returns (uint256 totalMembers, uint256 totalExpenses, uint256 totalAmount, uint256 totalSettlements)",
  "function getMemberInfo(address _member) external view returns (tuple(address wallet, string nickname, uint256 totalOwed, uint256 totalOwing, bool active, uint256 joinedAt))",
  "function getExpense(uint256 _expenseId) external view returns (tuple(uint256 id, string description, uint256 totalAmount, address paidBy, address[] participants, uint256[] shares, bool settled, uint256 timestamp, bytes32 receiptHash))"
];

class BlockchainSyncService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc.sepolia-api.lisk.com');
    this.factoryAddress = process.env.EXPENSE_FACTORY_ADDRESS || '0x4732bd7fA6D7063Cf88F308DA26Df28A6395Fa0A';
    this.factoryContract = new ethers.Contract(this.factoryAddress, EXPENSE_FACTORY_ABI, this.provider);
    this.lastProcessedBlock = null;
    this.isRunning = false;
  }

  async startSyncService() {
    if (this.isRunning) {
      console.log('🔄 Blockchain sync service already running');
      return;
    }

    console.log('🚀 Starting blockchain synchronization service...');
    this.isRunning = true;

    try {
      // Get starting block (either stored checkpoint or recent block)
      const currentBlock = await this.provider.getBlockNumber();
      this.lastProcessedBlock = currentBlock - 1000; // Start from 1000 blocks ago
      
      // Initial sync - process existing groups
      await this.syncExistingGroups();
      
      // Set up event listeners for real-time sync
      await this.setupEventListeners();
      
      // Start periodic sync for missed events
      this.startPeriodicSync();
      
      console.log('✅ Blockchain sync service started successfully');
    } catch (error) {
      console.error('❌ Failed to start blockchain sync service:', error);
      this.isRunning = false;
    }
  }

  async syncExistingGroups() {
    console.log('🔍 Syncing existing groups from blockchain...');
    
    try {
      const groupAddresses = await this.factoryContract.getAllGroups();
      console.log(`📊 Found ${groupAddresses.length} groups on blockchain`);
      
      for (const groupAddress of groupAddresses) {
        await this.syncGroup(groupAddress);
      }
      
      console.log('✅ Existing groups synchronized');
    } catch (error) {
      console.error('❌ Error syncing existing groups:', error);
    }
  }

  async syncGroup(groupAddress) {
    try {
      // Get group info from blockchain
      const groupInfo = await this.factoryContract.getGroupInfo(groupAddress);
      const groupContract = new ethers.Contract(groupAddress, GROUP_TREASURY_ABI, this.provider);
      const stats = await groupContract.getGroupStats();
      
      // Check if group exists in database
      let dbGroup = await Group.findOne({ contractAddress: groupAddress.toLowerCase() });
      
      if (!dbGroup) {
        // Create new group in database
        dbGroup = new Group({
          name: groupInfo.name,
          contractAddress: groupAddress.toLowerCase(),
          creator: {
            address: groupInfo.creator.toLowerCase(),
            nickname: 'Unknown', // Will be updated when we find member info
          },
          template: { category: 'custom' },
          settings: {
            privacy: 'public',
            maxMembers: 50,
            contributionFrequency: 'as-needed'
          },
          status: groupInfo.active ? 'active' : 'paused',
          financial: {
            totalBalance: '0',
            totalContributions: stats.totalAmount.toString(),
            totalExpenses: stats.totalAmount.toString(),
            lastUpdated: new Date().toISOString()
          },
          stats: {
            memberCount: Number(stats.totalMembers),
            totalTransactions: Number(stats.totalExpenses + stats.totalSettlements),
            activityScore: Math.min(100, Number(stats.totalExpenses) * 2),
            lastActivityAt: new Date().toISOString()
          },
          createdAt: new Date(Number(groupInfo.createdAt) * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        await dbGroup.save();
        console.log(`➕ Added group to database: ${groupInfo.name} (${groupAddress})`);
      } else {
        // Update existing group stats
        dbGroup.stats.memberCount = Number(stats.totalMembers);
        dbGroup.stats.totalTransactions = Number(stats.totalExpenses + stats.totalSettlements);
        dbGroup.financial.totalContributions = stats.totalAmount.toString();
        dbGroup.financial.totalExpenses = stats.totalAmount.toString();
        dbGroup.status = groupInfo.active ? 'active' : 'paused';
        dbGroup.updatedAt = new Date().toISOString();
        
        await dbGroup.save();
        console.log(`🔄 Updated group stats: ${groupInfo.name}`);
      }
      
      return dbGroup;
    } catch (error) {
      console.error(`❌ Error syncing group ${groupAddress}:`, error);
      return null;
    }
  }

  async setupEventListeners() {
    console.log('👂 Setting up blockchain event listeners...');
    
    // Listen for new groups
    this.factoryContract.on('GroupCreated', async (groupAddress, creator, name, timestamp, event) => {
      console.log(`🆕 New group created: ${name} at ${groupAddress}`);
      
      try {
        await this.syncGroup(groupAddress);
        await this.createActivity({
          type: 'group_created',
          groupAddress: groupAddress.toLowerCase(),
          actor: {
            address: creator.toLowerCase(),
            nickname: 'Creator'
          },
          metadata: {
            groupName: name,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          },
          timestamp: new Date(Number(timestamp) * 1000).toISOString()
        });
      } catch (error) {
        console.error('❌ Error processing GroupCreated event:', error);
      }
    });
    
    // Listen for group deactivation
    this.factoryContract.on('GroupDeactivated', async (groupAddress, timestamp, event) => {
      console.log(`⏸️ Group deactivated: ${groupAddress}`);
      
      try {
        await Group.updateOne(
          { contractAddress: groupAddress.toLowerCase() },
          { 
            status: 'paused',
            updatedAt: new Date().toISOString()
          }
        );
        
        await this.createActivity({
          type: 'group_paused',
          groupAddress: groupAddress.toLowerCase(),
          actor: {
            address: '0x0000000000000000000000000000000000000000',
            nickname: 'System'
          },
          metadata: {
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          },
          timestamp: new Date(Number(timestamp) * 1000).toISOString()
        });
      } catch (error) {
        console.error('❌ Error processing GroupDeactivated event:', error);
      }
    });
    
    console.log('✅ Event listeners established');
  }

  async setupGroupEventListeners(groupAddress) {
    const groupContract = new ethers.Contract(groupAddress, GROUP_TREASURY_ABI, this.provider);
    
    // Listen for new members
    groupContract.on('MemberAdded', async (member, nickname, timestamp, event) => {
      console.log(`👥 New member added to ${groupAddress}: ${nickname} (${member})`);
      
      try {
        // Update group in database
        await Group.updateOne(
          { contractAddress: groupAddress.toLowerCase() },
          { 
            $inc: { 'stats.memberCount': 1 },
            updatedAt: new Date().toISOString(),
            'stats.lastActivityAt': new Date().toISOString()
          }
        );
        
        await this.createActivity({
          type: 'member_joined',
          groupAddress: groupAddress.toLowerCase(),
          actor: {
            address: member.toLowerCase(),
            nickname: nickname
          },
          metadata: {
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          },
          timestamp: new Date(Number(timestamp) * 1000).toISOString()
        });
      } catch (error) {
        console.error('❌ Error processing MemberAdded event:', error);
      }
    });
    
    // Listen for expenses
    groupContract.on('ExpenseAdded', async (expenseId, paidBy, amount, description, event) => {
      console.log(`💰 New expense added to ${groupAddress}: ${description} (${amount})`);
      
      try {
        await this.createActivity({
          type: 'expense_added',
          groupAddress: groupAddress.toLowerCase(),
          actor: {
            address: paidBy.toLowerCase(),
            nickname: 'Member' // Will be updated with real nickname
          },
          metadata: {
            expenseId: Number(expenseId),
            amount: ethers.utils.formatEther(amount),
            currency: 'ETH',
            description: description,
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          },
          timestamp: new Date().toISOString()
        });
        
        // Update group financial stats
        await Group.updateOne(
          { contractAddress: groupAddress.toLowerCase() },
          { 
            $inc: { 
              'stats.totalTransactions': 1,
              'stats.activityScore': 2
            },
            'stats.lastActivityAt': new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        );
      } catch (error) {
        console.error('❌ Error processing ExpenseAdded event:', error);
      }
    });
    
    // Listen for debt settlements
    groupContract.on('DebtSettled', async (debtor, creditor, amount, settlementId, event) => {
      console.log(`💸 Debt settled in ${groupAddress}: ${ethers.formatEther(amount)} ETH`);
      
      try {
        await this.createActivity({
          type: 'debt_settled',
          groupAddress: groupAddress.toLowerCase(),
          actor: {
            address: debtor.toLowerCase(),
            nickname: 'Member'
          },
          target: {
            address: creditor.toLowerCase(),
            nickname: 'Member'
          },
          metadata: {
            amount: ethers.utils.formatEther(amount),
            currency: 'ETH',
            settlementId: Number(settlementId),
            txHash: event.transactionHash,
            blockNumber: event.blockNumber
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ Error processing DebtSettled event:', error);
      }
    });
  }

  async createActivity(activityData) {
    try {
      // Get group info for activity
      const group = await Group.findOne({ contractAddress: activityData.groupAddress });
      if (!group) {
        console.warn(`⚠️ Group not found for activity: ${activityData.groupAddress}`);
        return;
      }
      
      const activity = new Activity({
        ...activityData,
        groupName: group.name,
        privacy: 'public',
        status: 'completed',
        source: 'blockchain',
        interactions: {
          views: 0,
          reactions: [],
          comments: []
        }
      });
      
      await activity.save();
      console.log(`📝 Activity created: ${activityData.type} for group ${group.name}`);
      
      return activity;
    } catch (error) {
      console.error('❌ Error creating activity:', error);
    }
  }

  startPeriodicSync() {
    // Sync missed events every 5 minutes
    setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        const currentBlock = await this.provider.getBlockNumber();
        if (currentBlock > this.lastProcessedBlock) {
          console.log(`🔄 Processing blocks ${this.lastProcessedBlock + 1} to ${currentBlock}`);
          this.lastProcessedBlock = currentBlock;
        }
      } catch (error) {
        console.error('❌ Error in periodic sync:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  async stopSyncService() {
    console.log('⏹️ Stopping blockchain sync service...');
    this.isRunning = false;
    
    // Remove all listeners
    this.factoryContract.removeAllListeners();
    
    console.log('✅ Blockchain sync service stopped');
  }

  async healthCheck() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const isConnected = blockNumber > 0;
      
      return {
        status: this.isRunning ? 'running' : 'stopped',
        connected: isConnected,
        currentBlock: blockNumber,
        lastProcessed: this.lastProcessedBlock
      };
    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
const blockchainSync = new BlockchainSyncService();
module.exports = blockchainSync;