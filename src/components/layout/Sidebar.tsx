import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTaxNarrate } from '@/contexts/TaxNarrateContext';
import { ModeBadge } from '@/components/ui/mode-badge';
import { UserTypeToggle } from '@/components/ui/user-type-toggle';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calculator,
  CreditCard,
  Brain,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronUp,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import simplexIcon from '@/assets/simplex-icon.png';
import simplexLogo from '@/assets/simplex-logo.png';

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
  requiredMode?: 'secure' | 'secure_plus';
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Calculator, label: 'Tax Calculator', path: '/calculator' },
  { icon: CreditCard, label: 'Payments', path: '/payments', requiredMode: 'secure' },
  { icon: Brain, label: 'Narration', path: '/narration', requiredMode: 'secure' },
  { icon: BarChart3, label: 'Reports', path: '/reports', requiredMode: 'secure_plus' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { state, canAccessFeature } = useTaxNarrate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen bg-sidebar text-sidebar-foreground transition-smooth',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src={simplexIcon} alt="Simplex" className="w-8 h-8 object-contain" />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm">TaxNarrate</span>
            <span className="text-xs text-sidebar-foreground/60">Nigeria 2026</span>
          </div>
        )}
      </div>
      
      {/* Mode & User Type */}
      {!isCollapsed && (
        <div className="px-4 py-4 space-y-3 border-b border-sidebar-border">
          <ModeBadge />
          <UserTypeToggle className="w-full" />
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path, requiredMode }) => {
          const isActive = location.pathname === path;
          const isLocked = requiredMode && !canAccessFeature(requiredMode);
          
          return (
            <Link
              key={path}
              to={isLocked ? '#' : path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-smooth',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isLocked && 'opacity-50 cursor-not-allowed'
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {isLocked && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-accent-foreground">
                      {requiredMode === 'secure_plus' ? 'S+' : 'S'}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Upgrade CTA */}
      {!isCollapsed && state.currentMode !== 'secure_plus' && (
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="p-3 rounded-lg bg-sidebar-accent">
            <p className="text-xs text-sidebar-foreground/80 mb-2">
              {state.currentMode === 'lite' 
                ? 'Upgrade to unlock tax payment features'
                : 'Upgrade to Secure+ for auto-pay & analytics'
              }
            </p>
            <Button size="sm" className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90">
              <ChevronUp className="h-4 w-4 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      )}
      
      {/* Sponsor */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-sidebar-border">
          <p className="text-[10px] text-sidebar-foreground/50 mb-2 uppercase tracking-wide">Powered by</p>
          <img src={simplexLogo} alt="Simplex Business Solutions" className="h-8 object-contain opacity-80" />
        </div>
      )}
      
      {/* Support */}
      <div className="px-2 py-4 border-t border-sidebar-border">
        <Link
          to="/support"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent transition-smooth"
        >
          <HelpCircle className="h-5 w-5" />
          {!isCollapsed && <span>Support</span>}
        </Link>
      </div>
      
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-card border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth"
      >
        <Menu className="h-3 w-3" />
      </button>
    </aside>
  );
}

// Mobile Navigation
export function MobileNav() {
  const location = useLocation();
  const { canAccessFeature } = useTaxNarrate();
  
  const mobileItems = navItems.slice(0, 4).concat([
    { icon: Settings, label: 'More', path: '/settings' }
  ]);
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
      <div className="flex items-center justify-around py-2">
        {mobileItems.map(({ icon: Icon, label, path, requiredMode }) => {
          const isActive = location.pathname === path;
          const isLocked = requiredMode && !canAccessFeature(requiredMode);
          
          return (
            <Link
              key={path}
              to={isLocked ? '#' : path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 min-w-[60px]',
                isActive ? 'text-primary' : 'text-muted-foreground',
                isLocked && 'opacity-50'
              )}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Mobile Header
export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { state } = useTaxNarrate();
  
  return (
    <header className="lg:hidden sticky top-0 z-40 bg-card border-b">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src={simplexIcon} alt="Simplex" className="w-8 h-8 object-contain" />
          <span className="font-semibold">TaxNarrate</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ModeBadge />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-card border-b shadow-lg p-4 animate-slide-down">
          <UserTypeToggle className="w-full mb-4" />
          {state.currentMode !== 'secure_plus' && (
            <Button className="w-full">
              <ChevronUp className="h-4 w-4 mr-2" />
              Upgrade to {state.currentMode === 'lite' ? 'Secure' : 'Secure+'}
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
