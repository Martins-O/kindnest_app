'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';
import { GroupDirectory } from '@/components/GroupDirectory';

export default function DirectoryPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Compass className="h-10 w-10" />
              Discover Nests
            </h1>
            <p className="text-white/80">Find and join communities of care and support</p>
          </div>
        </div>

        {/* Group Directory */}
        <GroupDirectory />
      </div>
    </div>
  );
}