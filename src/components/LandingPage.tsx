import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, Target, TrendingUp, GraduationCap, Rocket, Brain, Globe } from 'lucide-react';
import { SignInButton, SignUpButton, useUser } from '@clerk/clerk-react';
import { LoadingScreen } from './LoadingScreen';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      <div className="min-h-screen bg-background selection:bg-primary/20">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-40 glass h-16 flex items-center px-6 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">EduAI</span>
          </div>
          <div className="flex items-center gap-4">
            {!isSignedIn && (
              <SignInButton mode="modal">
                <button className="text-sm font-medium hover:text-primary transition-colors">Sign In</button>
              </SignInButton>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8 border border-primary/20"
              >
                <Rocket className="w-4 h-4" />
                <span>The Future of Learning is Here</span>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-[0.9]"
              >
                Your Personal <br />
                <span className="gradient-text">AI Study Partner</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed"
              >
                Stop guessing what to learn. EduAI helps you build 
                personalized roadmaps and real-time job market insights just for you.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4"
              >
                {isSignedIn ? (
                  <button
                    onClick={onGetStarted}
                    className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20"
                  >
                    Enter Dashboard <ArrowRight className="w-6 h-6" />
                  </button>
                ) : (
                  <SignUpButton mode="modal">
                    <button className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20">
                      Start Learning Free <ArrowRight className="w-6 h-6" />
                    </button>
                  </SignUpButton>
                )}
              </motion.div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">Why Students Love EduAI</h2>
              <p className="text-muted-foreground">Everything you need to succeed in the modern world.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Brain className="w-6 h-6" />}
                title="AI Roadmaps"
                description="Custom paths for any skill, from Coding to Digital Marketing."
                color="bg-blue-500"
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="Market Trends"
                description="Real-time data on what skills are actually in demand right now."
                color="bg-purple-500"
              />
              <FeatureCard
                icon={<GraduationCap className="w-6 h-6" />}
                title="Study Partner"
                description="A 24/7 AI tutor that understands your syllabus and goals."
                color="bg-pink-500"
              />
              <FeatureCard
                icon={<Target className="w-6 h-6" />}
                title="Goal Tracking"
                description="Set your career targets and let AI guide you to the finish line."
                color="bg-orange-500"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border mt-20">
          <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
            <p>© 2026 EduAI. Built for students, by Chirag.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-2xl transition-all group"
    >
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
