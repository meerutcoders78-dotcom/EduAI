import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Search, 
  Loader2, 
  Sparkles,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Send,
  User,
  Bot,
  X,
  ArrowRight
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { generateSkillRoadmap, getRecommendedSkills } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutor' | 'market' | 'study'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedSkills, setRecommendedSkills] = useState<string | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);
  
  // Progress State
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [completedRoadmaps, setCompletedRoadmaps] = useState(0);

  const totalModules = 12; // 3 modules per card * 4 cards
  const progress = Math.round((completedModules.length / totalModules) * 100);

  // AI Tutor Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsSkillsLoading(true);
      try {
        const skills = await getRecommendedSkills();
        setRecommendedSkills(skills);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setIsSkillsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleChatSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const input = overrideInput || chatInput;
    if (!input.trim() || isChatLoading) return;

    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: input }]);
    setIsChatLoading(true);
    setActiveTab('tutor');

    try {
      const result = await generateSkillRoadmap(input);
      setChatMessages(prev => [...prev, { role: 'assistant', content: result }]);
      // Increment roadmap count if it's a new roadmap request
      if (input.toLowerCase().includes('roadmap') || input.toLowerCase().includes('path')) {
        setCompletedRoadmaps(prev => prev + 1);
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Let's try again in a moment." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCompleteModule = (moduleId: string) => {
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId]);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r border-border transition-all duration-300 flex flex-col z-50",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <span className="text-2xl font-black tracking-tighter gradient-text flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" /> EduAI
            </span>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-secondary rounded-xl transition-colors"
          >
            {isSidebarOpen ? <ChevronRight className="w-5 h-5 rotate-180" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Overview" 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<MessageSquare />} 
            label="AI Study Tutor" 
            active={activeTab === 'tutor'} 
            onClick={() => setActiveTab('tutor')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<BookOpen />} 
            label="Study Area" 
            active={activeTab === 'study'} 
            onClick={() => setActiveTab('study')}
            collapsed={!isSidebarOpen}
          />
          <SidebarItem 
            icon={<TrendingUp />} 
            label="Market Insights" 
            active={activeTab === 'market'} 
            onClick={() => setActiveTab('market')}
            collapsed={!isSidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-border bg-secondary/20">
          <div className={cn("flex items-center gap-3 p-2 rounded-2xl", !isSidebarOpen && "justify-center")}>
            <UserButton afterSignOutUrl="/" />
            {isSidebarOpen && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate">{user?.fullName || 'Student'}</span>
                <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold capitalize tracking-tight">
              {activeTab === 'overview' ? `Welcome back, ${user?.firstName || 'Student'}!` : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'overview' ? "Here's what's happening in your learning journey." : "Made by Chirag"}
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  <StatsCard 
                    icon={<GraduationCap className="w-5 h-5" />}
                    title="Learning Progress" 
                    value={`${progress}%`} 
                    trend="Top 10% of students"
                    color="text-blue-500"
                  />
                  <StatsCard 
                    icon={<BookOpen className="w-5 h-5" />}
                    title="Active Roadmaps" 
                    value={completedRoadmaps.toString()} 
                    trend="Keep it up!"
                    color="text-purple-500"
                  />
                  <StatsCard 
                    icon={<Lightbulb className="w-5 h-5" />}
                    title="AI Insights" 
                    value="14" 
                    trend="New trends found"
                    color="text-orange-500"
                  />
                </div>

                {/* Recommended Skills Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold tracking-tight">Trending Skills for 2026</h3>
                    <button onClick={() => setActiveTab('market')} className="text-sm font-bold text-primary hover:underline">View All Trends</button>
                  </div>
                  
                  {isSkillsLoading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-secondary/50 animate-pulse rounded-3xl border border-border" />
                      ))}
                    </div>
                  ) : recommendedSkills ? (
                    <div className="bg-card p-8 rounded-3xl border border-border shadow-sm markdown-body">
                      <Markdown>{recommendedSkills}</Markdown>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-secondary/20 rounded-3xl border-2 border-dashed border-border">
                      <p className="text-muted-foreground">No trending data available right now.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'tutor' && (
              <motion.div
                key="tutor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full max-w-5xl mx-auto"
              >
                <div className="flex-1 space-y-6 pb-24">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center">
                        <Bot className="w-10 h-10 text-primary" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="text-2xl font-bold mb-2">Your AI Study Tutor</h3>
                        <p className="text-muted-foreground">
                          Ask me to create a roadmap, explain a complex topic, or quiz you on your current syllabus.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                        <SuggestionButton onClick={() => handleChatSubmit(undefined, "Full Stack Web Dev 2026")}>"Roadmap for Web Dev"</SuggestionButton>
                        <SuggestionButton onClick={() => handleChatSubmit(undefined, "Explain Quantum Computing simply")}>"Explain Quantum Computing"</SuggestionButton>
                        <SuggestionButton onClick={() => handleChatSubmit(undefined, "Top AI skills to learn")}>"AI Skills for 2026"</SuggestionButton>
                        <SuggestionButton onClick={() => handleChatSubmit(undefined, "Data Science career path")}>"Data Science Path"</SuggestionButton>
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex gap-4 max-w-[85%]",
                          msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                          msg.role === 'user' ? "bg-primary text-white" : "bg-secondary text-primary"
                        )}>
                          {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>
                        <div className={cn(
                          "p-6 rounded-3xl border shadow-sm",
                          msg.role === 'user' 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-card border-border markdown-body"
                        )}>
                          {msg.role === 'user' ? (
                            <p className="font-medium">{msg.content}</p>
                          ) : (
                            <Markdown>{msg.content}</Markdown>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex gap-4 mr-auto">
                      <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                      <div className="p-6 rounded-3xl bg-secondary/50 border border-border">
                        <p className="text-sm text-muted-foreground animate-pulse">Thinking and searching the web...</p>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6">
                  <form 
                    onSubmit={handleChatSubmit}
                    className="relative flex items-center glass p-2 rounded-3xl shadow-2xl"
                  >
                    <input 
                      type="text"
                      placeholder="Ask your tutor anything..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-sm font-medium"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="p-4 bg-primary text-white rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'study' && (
              <motion.div
                key="study"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">Study Area</h2>
                    <p className="text-muted-foreground">Select a career path to start learning.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StudyCard 
                    id="web-dev"
                    title="Full Stack Web Development"
                    description="Master both frontend and backend technologies to build complete web applications."
                    topics={["HTML/CSS", "JavaScript/TypeScript", "React", "Node.js", "Databases"]}
                    completedModules={completedModules.filter(id => id.startsWith('web-dev-'))}
                    onViewSyllabus={() => setSelectedSyllabus("Full Stack Web Development")}
                  />
                  <StudyCard 
                    id="data-ai"
                    title="Data Science & AI"
                    description="Learn to analyze data and build intelligent systems using Python and Machine Learning."
                    topics={["Python", "Statistics", "Pandas/NumPy", "Scikit-Learn", "Neural Networks"]}
                    completedModules={completedModules.filter(id => id.startsWith('data-ai-'))}
                    onViewSyllabus={() => setSelectedSyllabus("Data Science & AI")}
                  />
                  <StudyCard 
                    id="mobile"
                    title="Mobile App Development"
                    description="Create stunning mobile experiences for iOS and Android using modern frameworks."
                    topics={["React Native", "Swift/Kotlin", "Mobile UI Design", "App Store Deployment"]}
                    completedModules={completedModules.filter(id => id.startsWith('mobile-'))}
                    onViewSyllabus={() => setSelectedSyllabus("Mobile App Development")}
                  />
                  <StudyCard 
                    id="cloud"
                    title="Cloud Engineering"
                    description="Design and manage scalable infrastructure on AWS, Azure, or Google Cloud."
                    topics={["Docker/Kubernetes", "Serverless", "CI/CD", "Cloud Security"]}
                    completedModules={completedModules.filter(id => id.startsWith('cloud-'))}
                    onViewSyllabus={() => setSelectedSyllabus("Cloud Engineering")}
                  />
                </div>

                <AnimatePresence>
                  {selectedSyllabus && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-card border border-border w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col"
                      >
                        <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-bold">{selectedSyllabus}</h3>
                          </div>
                          <button onClick={() => setSelectedSyllabus(null)} className="p-2 hover:bg-secondary rounded-full transition-colors">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-8 overflow-y-auto space-y-8">
                          <SyllabusModule 
                            id={`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m1`}
                            title="Module 1: Foundations & Setup"
                            content="In this module, you will learn the core fundamentals of the field. We cover the history, the current ecosystem, and how to set up your professional development environment. You'll build your first 'Hello World' project and understand the basic architecture that powers modern systems."
                            points={[
                              "Understanding the core architecture and design patterns",
                              "Setting up a professional-grade development environment",
                              "Mastering basic syntax and command-line tools",
                              "Version control fundamentals with Git"
                            ]}
                            isCompleted={completedModules.includes(`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m1`)}
                            onComplete={() => handleCompleteModule(`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m1`)}
                          />
                          <SyllabusModule 
                            id={`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m2`}
                            title="Module 2: Intermediate Concepts & APIs"
                            content="Now that you have the basics down, we dive into more complex logic. You'll learn how to handle asynchronous operations, work with external data sources through REST and GraphQL APIs, and manage complex state within your applications. This module focuses on building functional, data-driven components."
                            points={[
                              "Asynchronous programming and error handling",
                              "Integrating third-party services and APIs",
                              "Advanced state management strategies",
                              "Testing and debugging techniques"
                            ]}
                            isCompleted={completedModules.includes(`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m2`)}
                            onComplete={() => handleCompleteModule(`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m2`)}
                          />
                          <SyllabusModule 
                            id={`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m3`}
                            title="Module 3: Advanced Projects & Deployment"
                            content="The final phase is all about production-readiness. You will build a comprehensive capstone project that incorporates everything you've learned. We also cover performance optimization, security best practices, and how to deploy your work to the cloud for the world to see."
                            points={[
                              "Building a full-scale capstone project",
                              "Performance optimization and lazy loading",
                              "Security fundamentals and authentication",
                              "CI/CD pipelines and cloud deployment"
                            ]}
                            isCompleted={completedModules.includes(`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m3`)}
                            onComplete={() => handleCompleteModule(`${selectedSyllabus.toLowerCase().replace(/ /g, '-').substring(0, 8)}-m3`)}
                          />
                        </div>
                        <div className="p-6 border-t border-border bg-secondary/10 flex justify-end">
                          <button 
                            onClick={() => setSelectedSyllabus(null)}
                            className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-[1.02] transition-all"
                          >
                            Done
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === 'market' && (
              <motion.div
                key="market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-8"
              >
                 <div className="bg-card p-10 rounded-3xl border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold tracking-tight">2026 Job Market Insights</h2>
                        <p className="text-muted-foreground">Live data from global job boards and industry reports.</p>
                      </div>
                    </div>
                    
                    {isSkillsLoading ? (
                      <div className="space-y-4">
                        <div className="h-8 w-1/2 bg-secondary animate-pulse rounded-lg" />
                        <div className="h-32 w-full bg-secondary animate-pulse rounded-xl" />
                        <div className="h-32 w-full bg-secondary animate-pulse rounded-xl" />
                      </div>
                    ) : recommendedSkills ? (
                      <div className="markdown-body">
                        <Markdown>{recommendedSkills}</Markdown>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Fetching latest trends...</p>
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
        "w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all relative group",
        active 
          ? "bg-primary text-white shadow-lg shadow-primary/30" 
          : "hover:bg-secondary text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      <span className={cn("w-5 h-5 transition-transform group-hover:scale-110", active && "scale-110")}>{icon}</span>
      {!collapsed && <span className="font-bold text-sm">{label}</span>}
      {active && !collapsed && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
        />
      )}
    </button>
  );
}

function StatsCard({ title, value, trend, icon, color }: { title: string; value: string; trend: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl bg-secondary transition-colors group-hover:bg-primary/10 group-hover:text-primary", color)}>
          {icon}
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{trend}</span>
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <span className="text-4xl font-black tracking-tighter">{value}</span>
    </div>
  );
}

function SuggestionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-3 bg-card border border-border rounded-2xl text-sm font-bold hover:bg-secondary hover:border-primary/30 transition-all text-left w-full"
    >
      {children}
    </button>
  );
}

function StudyCard({ id, title, description, topics, completedModules, onViewSyllabus }: { 
  id: string;
  title: string; 
  description: string; 
  topics: string[]; 
  completedModules: string[];
  onViewSyllabus: () => void;
}) {
  const progress = Math.round((completedModules.length / 3) * 100);

  return (
    <div className="p-8 rounded-3xl bg-card border border-border shadow-sm flex flex-col h-full group hover:border-primary/50 transition-all">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{title}</h3>
          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">{progress}%</span>
        </div>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>
        
        <div className="w-full bg-secondary h-1.5 rounded-full mb-6 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>

        <div className="space-y-3 mb-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Curriculum Highlights</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, i) => (
              <span key={i} className="px-3 py-1 bg-secondary/50 border border-border rounded-full text-[11px] font-semibold">{topic}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <button 
          onClick={onViewSyllabus}
          className="w-full py-3 rounded-2xl font-bold bg-primary text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20 transition-all text-sm"
        >
          Open Study Material
        </button>
      </div>
    </div>
  );
}

function SyllabusModule({ id, title, content, points, isCompleted, onComplete }: { 
  id: string; 
  title: string; 
  content: string; 
  points: string[]; 
  isCompleted: boolean; 
  onComplete: () => void;
}) {
  return (
    <div className={cn(
      "p-6 rounded-2xl border transition-all",
      isCompleted ? "bg-emerald-500/5 border-emerald-500/20" : "bg-secondary/20 border-border"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-lg">{title}</h4>
        {isCompleted && <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">Completed ✓</span>}
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{content}</p>
      <ul className="space-y-2 mb-6">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            {point}
          </li>
        ))}
      </ul>
      <button 
        onClick={onComplete}
        disabled={isCompleted}
        className={cn(
          "px-6 py-2 rounded-xl text-xs font-bold transition-all",
          isCompleted 
            ? "bg-emerald-500/10 text-emerald-500 cursor-default" 
            : "bg-primary text-white hover:scale-105"
        )}
      >
        {isCompleted ? "Read & Completed" : "Mark as Read"}
      </button>
    </div>
  );
}
