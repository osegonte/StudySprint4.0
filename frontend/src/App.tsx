// src/App.tsx
import React, { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import { AppLayout } from "./components/layout/AppLayout";

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Topics = React.lazy(() => import("./pages/Topics"));
const PDFLibrary = React.lazy(() => import("./pages/PDFLibrary"));
const StudySession = React.lazy(() => import("./pages/StudySession"));
const Goals = React.lazy(() => import("./pages/Goals"));
const Notes = React.lazy(() => import("./pages/Notes"));
const Exercises = React.lazy(() => import("./pages/Exercises"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Settings = React.lazy(() => import("./pages/Settings"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Create React Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Add global error handler for React Query
queryClient.setMutationDefaults(['upload'], {
  retry: false, // Don't retry file uploads
});

// Loading fallback component
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

// Route wrapper with error boundary for each page
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            {/* Global toast notifications */}
            <Toaster 
              position="top-right" 
              richColors 
              expand={false}
              duration={4000}
              toastOptions={{
                style: {
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))', 
                  color: 'hsl(var(--card-foreground))',
                },
              }}
            />
            
            <Routes>
              {/* Main app routes with layout */}
              <Route path="/" element={
                <ErrorBoundary>
                  <AppLayout />
                </ErrorBoundary>
              }>
                <Route index element={
                  <RouteWrapper>
                    <Dashboard />
                  </RouteWrapper>
                } />
                <Route path="topics" element={
                  <RouteWrapper>
                    <Topics />
                  </RouteWrapper>
                } />
                <Route path="pdfs" element={
                  <RouteWrapper>
                    <PDFLibrary />
                  </RouteWrapper>
                } />
                <Route path="study" element={
                  <RouteWrapper>
                    <StudySession />
                  </RouteWrapper>
                } />
                <Route path="goals" element={
                  <RouteWrapper>
                    <Goals />
                  </RouteWrapper>
                } />
                <Route path="notes" element={
                  <RouteWrapper>
                    <Notes />
                  </RouteWrapper>
                } />
                <Route path="exercises" element={
                  <RouteWrapper>
                    <Exercises />
                  </RouteWrapper>
                } />
                <Route path="analytics" element={
                  <RouteWrapper>
                    <Analytics />
                  </RouteWrapper>
                } />
                <Route path="settings" element={
                  <RouteWrapper>
                    <Settings />
                  </RouteWrapper>
                } />
              </Route>

              {/* Redirect common alternative paths */}
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/library" element={<Navigate to="/pdfs" replace />} />
              <Route path="/session" element={<Navigate to="/study" replace />} />

              {/* 404 catch-all */}
              <Route path="*" element={
                <RouteWrapper>
                  <NotFound />
                </RouteWrapper>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;