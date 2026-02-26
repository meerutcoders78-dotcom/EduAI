import { useState } from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { ThemeProvider } from './components/ThemeProvider';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { Settings } from 'lucide-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border p-8 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">Setup Required</h1>
          <p className="text-muted-foreground">
            Please add your <strong>Clerk Publishable Key</strong> to the Secrets panel in AI Studio.
          </p>
          <div className="text-left bg-secondary p-4 rounded-lg text-xs font-mono break-all">
            VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
          </div>
          <p className="text-xs text-muted-foreground">
            Once added, the application will refresh and you can start learning.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ThemeProvider>
        <div className="relative min-h-screen">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>

          <SignedOut>
            <LandingPage onGetStarted={() => setShowDashboard(true)} />
          </SignedOut>

          <SignedIn>
            {showDashboard ? (
              <Dashboard />
            ) : (
              <LandingPage onGetStarted={() => setShowDashboard(true)} />
            )}
          </SignedIn>
        </div>
      </ThemeProvider>
    </ClerkProvider>
  );
}
