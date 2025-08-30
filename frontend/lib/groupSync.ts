'use client';

// Simple cross-tab synchronization for group membership changes
export class GroupSyncManager {
  private static instance: GroupSyncManager;
  private listeners: Map<string, () => void> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', this.handleStorageChange.bind(this));
    }
  }

  static getInstance(): GroupSyncManager {
    if (!GroupSyncManager.instance) {
      GroupSyncManager.instance = new GroupSyncManager();
    }
    return GroupSyncManager.instance;
  }

  // Notify all tabs that a user has been added to a group
  notifyMemberAdded(userAddress: string, groupAddress: string) {
    const event = {
      type: 'MEMBER_ADDED',
      userAddress,
      groupAddress,
      timestamp: Date.now(),
    };
    
    console.log('🔔 Broadcasting member added event:', event);
    localStorage.setItem('group-sync-event', JSON.stringify(event));
    
    // Trigger local listeners immediately for the new member
    const userKey = `user-groups-${userAddress}`;
    const userListener = this.listeners.get(userKey);
    if (userListener) {
      console.log(`🔄 Triggering immediate refresh for new member: ${userAddress.slice(0, 6)}...`);
      setTimeout(userListener, 2000); // Delay for blockchain sync
    }
    
    // Also trigger refresh for all dashboard listeners (general refresh)
    const dashboardKey = 'dashboard-refresh';
    const dashboardListener = this.listeners.get(dashboardKey);
    if (dashboardListener) {
      console.log('🔄 Triggering dashboard refresh for all users');
      setTimeout(dashboardListener, 3000); // Slightly longer delay
    }
  }

  // Listen for general dashboard changes (for dashboard page)
  onDashboardChange(callback: () => void) {
    const key = 'dashboard-refresh';
    this.listeners.set(key, callback);
    console.log('👂 Listening for dashboard changes');
  }

  // Listen for group membership changes for a specific user
  onUserGroupsChange(userAddress: string, callback: () => void) {
    const key = `user-groups-${userAddress}`;
    this.listeners.set(key, callback);
    
    console.log(`👂 Listening for group changes for user: ${userAddress.slice(0, 6)}...`);
  }

  // Remove listener
  removeListener(keyOrUserAddress: string) {
    // Support both direct keys and user addresses
    if (keyOrUserAddress.startsWith('user-groups-') || keyOrUserAddress === 'dashboard-refresh') {
      this.listeners.delete(keyOrUserAddress);
    } else {
      // Assume it's a user address
      const key = `user-groups-${keyOrUserAddress}`;
      this.listeners.delete(key);
    }
  }

  private handleStorageChange(event: StorageEvent) {
    if (event.key === 'group-sync-event' && event.newValue) {
      try {
        const syncEvent = JSON.parse(event.newValue);
        console.log('📡 Received cross-tab sync event:', syncEvent);
        
        if (syncEvent.type === 'MEMBER_ADDED') {
          // Trigger refresh for the specific user who was added
          const userKey = `user-groups-${syncEvent.userAddress}`;
          const userListener = this.listeners.get(userKey);
          if (userListener) {
            console.log(`🔄 Cross-tab: Triggering refetch for new member: ${syncEvent.userAddress.slice(0, 6)}...`);
            setTimeout(userListener, 2000); // Delay for blockchain sync
          }
          
          // Also trigger general dashboard refresh
          const dashboardKey = 'dashboard-refresh';
          const dashboardListener = this.listeners.get(dashboardKey);
          if (dashboardListener) {
            console.log('🔄 Cross-tab: Triggering dashboard refresh');
            setTimeout(dashboardListener, 3000);
          }
        }
      } catch (error) {
        console.error('Error parsing sync event:', error);
      }
    }
  }
}

export const groupSync = GroupSyncManager.getInstance();