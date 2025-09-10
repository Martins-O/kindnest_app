'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  Filter, 
  Star,
  Users,
  Clock,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { 
  GROUP_TEMPLATES, 
  getTemplatesByCategory, 
  searchTemplates,
  type GroupTemplate 
} from '@/lib/group-templates';

interface GroupTemplateSelectorProps {
  onTemplateSelect: (template: GroupTemplate) => void;
  onCreateCustom: () => void;
}

export function GroupTemplateSelector({ onTemplateSelect, onCreateCustom }: GroupTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', count: GROUP_TEMPLATES.length },
    { id: 'healthcare', name: 'Healthcare', count: getTemplatesByCategory('healthcare').length },
    { id: 'education', name: 'Education', count: getTemplatesByCategory('education').length },
    { id: 'emergency', name: 'Emergency', count: getTemplatesByCategory('emergency').length },
    { id: 'lifestyle', name: 'Lifestyle', count: getTemplatesByCategory('lifestyle').length },
    { id: 'financial', name: 'Financial', count: getTemplatesByCategory('financial').length },
  ];

  const filteredTemplates = searchQuery 
    ? searchTemplates(searchQuery)
    : selectedCategory === 'all' 
      ? GROUP_TEMPLATES 
      : getTemplatesByCategory(selectedCategory);

  const handleTemplateSelect = (template: GroupTemplate) => {
    onTemplateSelect(template);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Choose a Group Template</h2>
        <p className="text-white/70">
          Start with a pre-configured template or create your own custom group
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-3 h-4 w-4 text-white/50" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm appearance-none cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const IconComponent = template.icon;
          const isExpanded = showDetails === template.id;
          
          return (
            <Card 
              key={template.id} 
              className="bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
              onClick={() => setShowDetails(isExpanded ? null : template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    {template.privacy === 'private' ? (
                      <EyeOff className="h-4 w-4 text-white/40" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/40" />
                    )}
                    <span className="text-xs text-white/40 capitalize">{template.category}</span>
                  </div>
                </div>
                
                <CardTitle className="text-white text-lg mb-2">{template.name}</CardTitle>
                <p className="text-white/70 text-sm line-clamp-2">{template.description}</p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center gap-4 text-xs text-white/60 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.estimatedMemberCount.min}-{template.estimatedMemberCount.max}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.suggestedContributionFrequency}
                  </div>
                </div>

                {isExpanded && (
                  <div className="space-y-3 mb-4 animate-in slide-in-from-top-1">
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">Initial Amount</h4>
                      <p className="text-white/70 text-xs">{template.suggestedInitialAmount} ETH</p>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium text-sm mb-1">Key Features</h4>
                      <ul className="text-white/60 text-xs space-y-1">
                        {template.defaultGuidelines.slice(0, 3).map((guideline, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">•</span>
                            {guideline}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 4).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Use This Template
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-white/40" />
          </div>
          <h3 className="text-white font-medium mb-2">No templates found</h3>
          <p className="text-white/60 text-sm mb-4">
            Try adjusting your search or filters, or create a custom group.
          </p>
          <Button onClick={onCreateCustom} variant="outline" className="bg-white/10 border-white/20 text-white">
            Create Custom Group
          </Button>
        </div>
      )}

      {/* Custom Group Option */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10 border-dashed">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-white/70" />
          </div>
          <h3 className="text-white font-medium mb-2">Need Something Different?</h3>
          <p className="text-white/70 text-sm mb-4">
            Create a custom group with your own settings and guidelines.
          </p>
          <Button 
            onClick={onCreateCustom}
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Create Custom Group
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}