// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Pages
import Dashboard from './pages/Dashboard';
import Topics from './pages/Topics';
import PDFLibrary from './pages/PDFLibrary';
import PDFViewer from './pages/PDFViewer';
import StudySession from './pages/StudySession';
import Notes from './pages/Notes';
import Exercises from './pages/Exercises';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Layout
import { AppLayout } from './components/layout/AppLayout';
import MobileNav from './components/layout/MobileNav';
import OnboardingWizard from './components/onboarding/OnboardingWizard';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <OnboardingWizard />
          <Toaster position="top-right" />
          <AppLayout />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/pdfs" element={<PDFLibrary />} />
            <Route path="/pdfs/:id" element={<PDFViewer />} />
            <Route path="/study" element={<StudySession />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileNav />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;