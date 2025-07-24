import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/study', label: 'Study', icon: '⏱️' },
  { to: '/notes', label: 'Notes', icon: '📝' },
  { to: '/pdfs', label: 'PDFs', icon: '📄' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function MobileNav() {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t flex justify-around items-center h-14 z-50 shadow-lg md:hidden">
      {tabs.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          className={`flex flex-col items-center text-xs ${location.pathname === tab.to ? 'text-blue-600 font-bold' : 'text-zinc-500'}`}
        >
          <span className="text-xl">{tab.icon}</span>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
} 