import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  Calendar,
  Grid,
  Users,
  Receipt,
  ShieldCheck,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin, adminName, openLoginModal, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'monthly', label: 'Monthly', icon: Calendar },
    { id: 'yearly', label: 'Yearly', icon: Grid },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
  ];

  return (
    <>
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none min-w-0 pr-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-0.5 shadow-sm border border-amber-200 flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/logo.png" alt="Vighnaharta Mandal Logo" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-xs sm:text-base text-stone-900 tracking-tight leading-tight truncate">
                Ganesh Chaturthi <span className="text-amber-600 font-black">Mandal</span>
              </h1>
              <p className="text-[10px] sm:text-[11px] font-semibold text-stone-500 tracking-wide mt-0.5 truncate">
                Fund & Expense Tracker
              </p>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 bg-amber-50/80 p-1 rounded-2xl border border-amber-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-amber-800 hover:bg-amber-100/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Admin Indicator & Auth Control */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Admin ({adminName})
                </span>
                <button
                  onClick={logout}
                  title="Sign out of Admin Mode"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 festive-gradient text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200 px-2 py-1.5 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-700 font-black bg-amber-100/70 scale-105'
                    : 'text-stone-500 font-medium hover:text-amber-600'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] mt-0.5 leading-none tracking-tighter truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
