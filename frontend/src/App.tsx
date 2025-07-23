// src/App.tsx
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Topics from "./pages/Topics";
import PDFLibrary from "./pages/PDFLibrary";
import StudySession from "./pages/StudySession";
import Goals from "./pages/Goals";
import Notes from "./pages/Notes";
import Exercises from "./pages/Exercises";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Something went wrong
            </h1>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        console.error('Query failed:', error);
        return failureCount < 2;
      },
    },
  },
});

// Safe component wrapper
const SafeComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Component render error:', error);
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Failed to load component</p>
      </div>
    );
  }
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster position="top-right" richColors />
            <Routes>
              <Route path="/" element={
                <SafeComponent>
                  <AppLayout />
                </SafeComponent>
              }>
                <Route index element={
                  <SafeComponent>
                    <Dashboard />
                  </SafeComponent>
                } />
                <Route path="topics" element={
                  <SafeComponent>
                    <Topics />
                  </SafeComponent>
                } />
                <Route path="pdfs" element={
                  <SafeComponent>
                    <PDFLibrary />
                  </SafeComponent>
                } />
                <Route path="study" element={
                  <SafeComponent>
                    <StudySession />
                  </SafeComponent>
                } />
                <Route path="goals" element={
                  <SafeComponent>
                    <Goals />
                  </SafeComponent>
                } />
                <Route path="notes" element={
                  <SafeComponent>
                    <Notes />
                  </SafeComponent>
                } />
                <Route path="exercises" element={
                  <SafeComponent>
                    <Exercises />
                  </SafeComponent>
                } />
                <Route path="analytics" element={
                  <SafeComponent>
                    <Analytics />
                  </SafeComponent>
                } />
                <Route path="settings" element={
                  <SafeComponent>
                    <Settings />
                  </SafeComponent>
                } />
              </Route>
              <Route path="*" element={
                <SafeComponent>
                  <NotFound />
                </SafeComponent>
              } />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;