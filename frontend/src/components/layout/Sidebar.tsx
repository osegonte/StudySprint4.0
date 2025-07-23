// src/components/layout/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  BookOpen,
  FileText,
  Target,
  BarChart3,
  Clock,
  StickyNote,
  Settings,
  GraduationCap,
  Brain
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Topics', href: '/topics', icon: BookOpen },
  { name: 'PDF Library', href: '/pdfs', icon: FileText },
  { name: 'Study Sessions', href: '/study', icon: Clock },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Exercises', href: '/exercises', icon: Brain },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Logo/Brand */}
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold text-foreground">StudySprint</span>
        <span className="text-xs text-muted-foreground bg-primary/10 text-primary px-2 py-1 rounded-full">v4.0</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User profile area */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full text-white font-medium text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name || 'Guest User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.level ? `Level ${user.level} Scholar` : 'Getting Started'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};