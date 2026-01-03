import { useTaxNarrate, UserType } from '@/contexts/TaxNarrateContext';
import { cn } from '@/lib/utils';
import { User, Building2 } from 'lucide-react';

interface UserTypeToggleProps {
  className?: string;
}

export function UserTypeToggle({ className }: UserTypeToggleProps) {
  const { state, setUserType } = useTaxNarrate();
  
  const options: { value: UserType; label: string; icon: typeof User }[] = [
    { value: 'individual', label: 'Individual', icon: User },
    { value: 'business', label: 'Business', icon: Building2 },
  ];
  
  return (
    <div className={cn('inline-flex rounded-lg border bg-muted p-1', className)}>
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setUserType(value)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-smooth',
            state.userType === value
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
