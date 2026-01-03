import { useTaxNarrate, UserMode } from '@/contexts/TaxNarrateContext';
import { cn } from '@/lib/utils';
import { Lock, Shield, ShieldCheck } from 'lucide-react';

interface ModeBadgeProps {
  mode?: UserMode;
  className?: string;
  showIcon?: boolean;
}

const modeConfig: Record<UserMode, { label: string; icon: typeof Lock; className: string }> = {
  lite: {
    label: 'Lite',
    icon: Lock,
    className: 'mode-badge-lite',
  },
  secure: {
    label: 'Secure',
    icon: Shield,
    className: 'mode-badge-secure',
  },
  secure_plus: {
    label: 'Secure+',
    icon: ShieldCheck,
    className: 'mode-badge-secure-plus',
  },
};

export function ModeBadge({ mode, className, showIcon = true }: ModeBadgeProps) {
  const { state } = useTaxNarrate();
  const currentMode = mode ?? state.currentMode;
  const config = modeConfig[currentMode];
  const Icon = config.icon;
  
  return (
    <span className={cn('mode-badge', config.className, className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  );
}
