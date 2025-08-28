import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface SampleDataIndicatorProps {
  isUsingSampleData: boolean;
}

export function SampleDataIndicator({ isUsingSampleData }: SampleDataIndicatorProps) {
  if (!isUsingSampleData) return null;

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Demo Mode
        </Badge>
        Currently showing sample data. The backend API is not available, but all features are fully functional.
      </AlertDescription>
    </Alert>
  );
}