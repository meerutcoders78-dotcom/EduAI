import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Loader2,
  Sparkles
} from 'lucide-react';
import { UserButton, useUser, SignOutButton } from '@clerk/clerk-react';
import { generateSkillRoadmap, getRecommendedSkills } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

export function Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutor' | 'market'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedSkills, setRecommendedSkills] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await getRecommendedSkills();
        setRecommendedSkills(skills);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      }
    };
    fetchSkills();
  }, []);

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setActiveTab('tutor');
    try {
      const result = await generateSkillRoadmap(searchQuery);
      setRoadmap(result);
    } catch (error) {
      console.error("Error generating roadmap", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="text-xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6" /> EduAI
            </span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<MessageSquare />} 
            label="AI Tutor" 
            active={activeTab === 'tutor'} 
            onClick={() => setActiveTab('tutor')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<TrendingUp />} 
            label="Market Trends" 
            active={activeTab === 'market'} 
            onClick={() => setActiveTab('market')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <UserButton afterSignOutUrl="/" />
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-medium truncate max-w-[140px]">{user?.fullName}</span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-bottom border-border bg-card flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold capitalize">{activeTab.replace('-', ' ')}</h2>
          <form onSubmit={handleGenerateRoadmap} className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="What skill do you want to learn?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </form>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <StatsCard title="Completed Lessons" value="12" trend="+2 this week" />
                  <StatsCard title="Learning Hours" value="48h" trend="+5h this week" />
                  <StatsCard title="Skills in Progress" value="3" trend="Next: React Native" />
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-6">Recommended for 2026</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendedSkills ? (
                      <div className="col-span-full bg-card p-6 rounded-2xl border border-border markdown-body">
                        <Markdown>{recommendedSkills}</Markdown>
                      </div>
                    ) : (
                      <div className="col-span-full flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'tutor' && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto"
              >
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground animate-pulse">Consulting Gemini 3.1 Pro & Live Market Data...</p>
                  </div>
                ) : roadmap ? (
                  <div className="bg-card p-8 rounded-2xl border border-border shadow-sm markdown-body">
                    <Markdown>{roadmap}</Markdown>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to learn something new?</h3>
                    <p className="text-muted-foreground">Search for a skill above to generate a personalized roadmap.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                 <div className="bg-card p-8 rounded-2xl border border-border shadow-sm markdown-body">
                    <h2 className="text-2xl font-bold mb-4">2026 Job Market Insights</h2>
                    <p className="text-muted-foreground mb-6">Real-time data fetched from global job boards and educational trends.</p>
                    {recommendedSkills ? (
                      <Markdown>{recommendedSkills}</Markdown>
                    ) : (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, collapsed }: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  collapsed: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
        active ? "bg-primary text-primary-foreground shadow-lg" : "hover:bg-secondary text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <span className="w-5 h-5">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function StatsCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">{trend}</span>
      </div>
    </div>
  );
}
