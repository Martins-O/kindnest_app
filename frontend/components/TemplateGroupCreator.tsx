'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  Check, 
  Edit3,
  Users,
  Clock,
  DollarSign,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { type GroupTemplate } from '@/lib/group-templates';

interface TemplateGroupCreatorProps {
  template: GroupTemplate;
  onBack: () => void;
  onCreateGroup: (groupData: {
    name: string;
    creatorNickname: string;
    template: GroupTemplate;
    customizations: {
      initialAmount?: string;
      contributionFrequency?: string;
      privacy?: 'public' | 'private';
      customGuidelines?: string[];
      maxMembers?: number;
    };
  }) => void;
}

export function TemplateGroupCreator({ template, onBack, onCreateGroup }: TemplateGroupCreatorProps) {
  const [groupName, setGroupName] = useState('');
  const [creatorNickname, setCreatorNickname] = useState('');
  const [customizations, setCustomizations] = useState({
    initialAmount: template.suggestedInitialAmount,
    contributionFrequency: template.suggestedContributionFrequency,
    privacy: template.privacy,
    customGuidelines: [...template.defaultGuidelines],
    maxMembers: template.estimatedMemberCount.max
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingGuideline, setEditingGuideline] = useState<number | null>(null);

  const IconComponent = template.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && creatorNickname.trim()) {
      onCreateGroup({
        name: groupName.trim(),
        creatorNickname: creatorNickname.trim(),
        template,
        customizations
      });
    }
  };

  const updateGuideline = (index: number, newText: string) => {
    const newGuidelines = [...customizations.customGuidelines];
    newGuidelines[index] = newText;
    setCustomizations({
      ...customizations,
      customGuidelines: newGuidelines
    });
    setEditingGuideline(null);
  };

  const addGuideline = () => {
    setCustomizations({
      ...customizations,
      customGuidelines: [...customizations.customGuidelines, '']
    });
    setEditingGuideline(customizations.customGuidelines.length);
  };

  const removeGuideline = (index: number) => {
    const newGuidelines = customizations.customGuidelines.filter((_, i) => i !== index);
    setCustomizations({
      ...customizations,
      customGuidelines: newGuidelines
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Create Group from Template</h2>
          <p className="text-white/70">Customize your {template.name}</p>
        </div>
      </div>

      {/* Template Overview */}
      <Card className="bg-white/5 backdrop-blur-lg border-white/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-lg ${template.color} flex items-center justify-center`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-white text-xl mb-2">{template.name}</CardTitle>
              <p className="text-white/70 text-sm">{template.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {template.estimatedMemberCount.min}-{template.estimatedMemberCount.max} members
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {template.suggestedContributionFrequency}
                </div>
                <div className="flex items-center gap-1">
                  {template.privacy === 'private' ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {template.privacy}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Group Setup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Group Name *
              </label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={`e.g., "Smith Family ${template.name}"`}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Your Nickname *
              </label>
              <Input
                value={creatorNickname}
                onChange={(e) => setCreatorNickname(e.target.value)}
                placeholder="How should other members know you?"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Quick Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Initial Contribution (ETH)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customizations.initialAmount}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    initialAmount: e.target.value
                  })}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Contribution Frequency
                </label>
                <select
                  value={customizations.contributionFrequency}
                  onChange={(e) => setCustomizations({
                    ...customizations,
                    contributionFrequency: e.target.value as any
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white"
                >
                  <option value="weekly" className="bg-gray-800">Weekly</option>
                  <option value="monthly" className="bg-gray-800">Monthly</option>
                  <option value="quarterly" className="bg-gray-800">Quarterly</option>
                  <option value="one-time" className="bg-gray-800">One-time</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Privacy Setting
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="private"
                    checked={customizations.privacy === 'private'}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      privacy: 'private'
                    })}
                    className="text-blue-600"
                  />
                  <EyeOff className="h-4 w-4 text-white/70" />
                  <span className="text-white/90 text-sm">Private (Invite only)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="public"
                    checked={customizations.privacy === 'public'}
                    onChange={(e) => setCustomizations({
                      ...customizations,
                      privacy: 'public'
                    })}
                    className="text-blue-600"
                  />
                  <Eye className="h-4 w-4 text-white/70" />
                  <span className="text-white/90 text-sm">Public (Discoverable)</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardHeader>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full justify-between text-white hover:bg-white/10"
            >
              <CardTitle className="text-white">Group Guidelines</CardTitle>
              <Edit3 className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CardHeader>
          
          {showAdvanced && (
            <CardContent className="space-y-3">
              <p className="text-white/70 text-sm mb-4">
                Customize the rules and guidelines for your group:
              </p>
              
              {customizations.customGuidelines.map((guideline, index) => (
                <div key={index} className="flex items-start gap-2">
                  {editingGuideline === index ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={guideline}
                        onChange={(e) => {
                          const newGuidelines = [...customizations.customGuidelines];
                          newGuidelines[index] = e.target.value;
                          setCustomizations({
                            ...customizations,
                            customGuidelines: newGuidelines
                          });
                        }}
                        className="bg-white/10 border-white/20 text-white text-sm"
                        onBlur={() => setEditingGuideline(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingGuideline(null);
                          }
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setEditingGuideline(null)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-start gap-2 group">
                      <span className="text-blue-400 mt-1">•</span>
                      <span 
                        className="text-white/80 text-sm flex-1 cursor-pointer group-hover:text-white"
                        onClick={() => setEditingGuideline(index)}
                      >
                        {guideline || 'Click to edit...'}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGuideline(index)}
                          className="h-6 w-6 p-0 text-white/50 hover:text-white"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        {customizations.customGuidelines.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => removeGuideline(index)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addGuideline}
                className="bg-white/5 border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
              >
                Add Guideline
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Back to Templates
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!groupName.trim() || !creatorNickname.trim()}
          >
            Create {template.name}
          </Button>
        </div>
      </form>
    </div>
  );
}