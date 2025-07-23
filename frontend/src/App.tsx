import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Topics from "./pages/Topics";
import PDFLibrary from "./pages/PDFLibrary";
import StudySession from "./pages/StudySession";
import Notes from "./pages/Notes";
import Exercises from "./pages/Exercises";
import Goals from "./pages/Goals";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="topics" element={<Topics />} />
            <Route path="pdfs" element={<PDFLibrary />} />
            <Route path="study" element={<StudySession />} />
            <Route path="goals" element={<Goals />} />
            <Route path="notes" element={<Notes />} />
            <Route path="exercises" element={<Exercises />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;