'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Filter, 
  Grid,
  List,
  Star,
  Shield,
  Users,
  TrendingUp,
  Clock,
  MapPin,
  Tag,
  Eye,
  EyeOff,
  ChevronDown,
  ExternalLink,
  Plus,
  Heart,
  BookOpen,
  AlertTriangle,
  DollarSign,
  Home
} from 'lucide-react';
import { apiClient, type GroupData } from '@/lib/api';
import { getRelativeTime, shortenAddress } from '@/lib/utils';

interface GroupDirectoryProps {
  onJoinGroup?: (group: GroupData) => void;
  onViewGroup?: (group: GroupData) => void;
  showCreateButton?: boolean;
  onCreateGroup?: () => void;
}

export function GroupDirectory({
  onJoinGroup,
  onViewGroup,
  showCreateButton = false,
  onCreateGroup
}: GroupDirectoryProps) {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('activity_desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);

  const categories = [
    { id: 'all', name: 'All Categories', icon: Grid },
    { id: 'healthcare', name: 'Healthcare', icon: Heart },
    { id: 'education', name: 'Education', icon: BookOpen },
    { id: 'emergency', name: 'Emergency', icon: AlertTriangle },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'lifestyle', name: 'Lifestyle', icon: Home },
    { id: 'custom', name: 'Custom', icon: Tag }
  ];

  const sortOptions = [
    { value: 'activity_desc', label: 'Most Active' },
    { value: 'newest', label: 'Newest First' },
    { value: 'members_desc', label: 'Most Members' },
    { value: 'name_asc', label: 'Name A-Z' }
  ];

  const loadGroups = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        sortBy
      };

      const result = await apiClient.getGroups(params);
      
      if (page === 1) {
        setGroups(result.groups);
      } else {
        setGroups(prev => [...prev, ...result.groups]);
      }
      
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      setTotalGroups(result.pagination.total);
      
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1);
      loadGroups(1);
    }, searchQuery ? 500 : 0);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, sortBy]);

  const loadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadGroups(currentPage + 1);
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    const IconComponent = categoryData?.icon || Tag;
    return <IconComponent className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      healthcare: 'bg-red-500/20 text-red-300',
      education: 'bg-blue-500/20 text-blue-300',
      emergency: 'bg-orange-500/20 text-orange-300',
      financial: 'bg-green-500/20 text-green-300',
      lifestyle: 'bg-purple-500/20 text-purple-300',
      custom: 'bg-gray-500/20 text-gray-300'
    };
    
    return colorMap[category] || 'bg-gray-500/20 text-gray-300';
  };

  const handleViewGroup = (group: GroupData) => {
    if (onViewGroup) {
      onViewGroup(group);
    } else {
      window.open(`/groups/${group.contractAddress}`, '_blank');
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen p-6">
      {/* Header Stats */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/50 shadow-2xl rounded-3xl">
        <CardContent className="pt-8 pb-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Discover</span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"> Nests</span>
            </h2>
            <p className="text-slate-600 text-lg font-medium">
              Join communities of care and support from around the world
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{totalGroups}</div>
              <p className="text-slate-600 text-sm font-semibold">Active Groups</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{categories.length - 1}</div>
              <p className="text-slate-600 text-sm font-semibold">Categories</p>
            </div>
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">24/7</div>
              <p className="text-slate-600 text-sm font-semibold">Support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-white/80 backdrop-blur-lg border-white/50 shadow-xl rounded-3xl">
        <CardContent className="pt-8">
          <div className="flex flex-col gap-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search groups by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-emerald-400 focus:ring-emerald-400 rounded-2xl py-4 shadow-lg text-lg"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm cursor-pointer shadow-lg focus:border-emerald-400 focus:ring-emerald-400 font-semibold"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-white text-slate-800">
                      {category.name}
                    </option>
                  ))}
                </select>
                
                {/* Sort Filter */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm cursor-pointer shadow-lg focus:border-emerald-400 focus:ring-emerald-400 font-semibold"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-slate-800">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-white shadow-lg">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className={`rounded-none border-0 ${viewMode === 'grid' ? 'bg-emerald-500 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className={`rounded-none border-0 ${viewMode === 'list' ? 'bg-emerald-500 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid/List */}
      {loading && groups.length === 0 ? (
        <div className="text-center py-16 bg-white/60 backdrop-blur-lg rounded-3xl shadow-lg border border-white/50">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Search className="h-10 w-10 text-slate-800 animate-pulse" />
          </div>
          <div className="text-slate-600 text-lg font-semibold">Loading groups...</div>
        </div>
      ) : groups.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-lg border-white/50 shadow-xl rounded-3xl">
          <CardContent className="pt-16 pb-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Search className="h-10 w-10 text-slate-500" />
              </div>
              <h3 className="text-slate-800 font-bold text-xl mb-3">No groups found</h3>
              <p className="text-slate-600 text-sm mb-6 font-medium">
                Try adjusting your search terms or filters
              </p>
              {showCreateButton && (
                <Button onClick={onCreateGroup} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-800 shadow-lg rounded-xl px-6 py-3">
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Group
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-8' 
          : 'space-y-6'
        }>
          {groups.map((group) => (
            <Card 
              key={group._id}
              className="bg-white/90 backdrop-blur-lg border-white/50 hover:bg-white/95 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl rounded-3xl shadow-lg"
              onClick={() => handleViewGroup(group)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${getCategoryColor(group.template.category)}`}>
                        {getCategoryIcon(group.template.category)}
                      </div>
                      <div className="flex items-center gap-1">
                        {group.settings.privacy === 'private' ? (
                          <EyeOff className="h-3 w-3 text-slate-40" />
                        ) : (
                          <Eye className="h-3 w-3 text-slate-40" />
                        )}
                        <span className="text-xs text-slate-40 capitalize">
                          {group.settings.privacy}
                        </span>
                      </div>
                    </div>
                    
                    <CardTitle className="text-slate-800 text-xl mb-2 group-hover:text-emerald-600 transition-colors font-bold">
                      {group.name}
                    </CardTitle>
                    
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3 font-medium">
                      {group.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-60 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{group.stats.memberCount} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-60 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Score: {group.stats.activityScore}</span>
                  </div>
                </div>
                
                {/* Tags */}
                {group.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-1 bg-white/10 rounded-full text-xs text-slate-70"
                      >
                        #{tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-slate-50">
                        +{group.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                {/* Location & Time */}
                <div className="flex items-center justify-between text-xs text-slate-50 mb-4">
                  {group.location?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{group.location.city}, {group.location.region}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{getRelativeTime(new Date(group.stats.lastActivityAt))}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewGroup(group);
                    }}
                  >
                    View Group
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-slate-800 hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onJoinGroup) {
                        onJoinGroup(group);
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More */}
      {currentPage < totalPages && (
        <div className="text-center">
          <Button
            onClick={loadMore}
            loading={loading}
            variant="outline"
            size="lg"
            className="bg-white/80 border-slate-200 text-slate-700 hover:bg-white shadow-xl rounded-2xl px-8 py-4 font-semibold"
          >
            Load More Groups ({groups.length} of {totalGroups})
          </Button>
        </div>
      )}
    </div>
  );
}