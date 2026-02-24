import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Target, TrendingUp } from 'lucide-react';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Skilling for 2026</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
              Master the Future with <span className="text-primary">EduAI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              Personalized learning roadmaps powered by Gemini 3.1 Pro. 
              Get real-time job market insights and stay ahead of the curve.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isSignedIn ? (
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <button className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition-all">
                      Get Started Free <ArrowRight className="w-5 h-5" />
                    </button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-accent transition-all">
                      Sign In
                    </button>
                  </SignInButton>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="w-8 h-8 text-primary" />}
              title="Personalized Roadmaps"
              description="AI-generated learning paths tailored to your career goals and current skill level."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8 text-primary" />}
              title="Real-time Market Data"
              description="Powered by Google Search Grounding to provide the latest salary trends and job demand."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="AI Tutoring"
              description="Interactive chat interface to answer your technical questions and guide your learning."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl bg-card border border-border shadow-sm"
    >
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
