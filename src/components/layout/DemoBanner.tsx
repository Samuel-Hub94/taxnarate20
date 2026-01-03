import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';

export function DemoBanner() {
  const { state, dismissDemoBanner } = useTaxNarrate();
  
  if (state.demoBannerDismissed) return null;
  
  return (
    <div className="bg-warning/10 border-b border-warning/20 px-4 py-2">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="font-medium text-foreground">DEMO APPLICATION</span>
          <span className="hidden sm:inline text-muted-foreground">
            — This is a demonstration platform. Payments are simulated. NRS/FIRS integration pending regulatory approval.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-warning/20"
          onClick={dismissDemoBanner}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
