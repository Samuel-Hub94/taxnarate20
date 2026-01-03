import { ReactNode } from 'react';
import { DemoBanner } from './DemoBanner';
import { Sidebar, MobileNav, MobileHeader } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DemoBanner />
      
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col min-h-screen lg:min-h-[calc(100vh-40px)]">
          <MobileHeader />
          
          <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
            {children}
          </main>
          
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
