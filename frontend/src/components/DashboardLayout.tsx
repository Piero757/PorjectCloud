'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <div className="md:hidden flex items-center p-4 border-b border-white/10 glass-card rounded-none">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-300 p-2">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            FinanzasIA
          </span>
        </div>
        <div className="p-4 md:p-8 flex-1 w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
