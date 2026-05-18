'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Wallet, PieChart, TrendingUp, LogOut, FileText, X } from 'lucide-react';

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Movimientos', path: '/movimientos', icon: <Wallet size={20} /> },
    { name: 'Presupuestos', path: '/presupuestos', icon: <PieChart size={20} /> },
    { name: 'Predicciones', path: '/predicciones', icon: <TrendingUp size={20} /> },
    { name: 'Impuestos', path: '/impuestos', icon: <FileText size={20} /> },
  ];

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <div className={`w-64 h-screen glass-card rounded-none border-y-0 border-l-0 fixed left-0 top-0 flex flex-col pt-8 pb-4 z-50 transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="px-6 mb-8 flex justify-between items-center">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            NexoFin
          </div>
          {onClose && (
            <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          )}
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link href={item.path} key={item.path} onClick={() => onClose && onClose()}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.path ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-gray-300'}`}>
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          ))}
        </nav>
        <div className="px-4 mt-auto">
          <button onClick={handleLogout} className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
}
