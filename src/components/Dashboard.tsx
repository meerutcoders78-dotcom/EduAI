import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
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
  Award,
  ExternalLink,
  Linkedin
} from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { generateSkillRoadmap, getRecommendedSkills } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';
import { MODULES, ModuleInfo } from '../constants/modules';
import { Certificate as CertificateComponent } from './Certificate';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Certificate {
  id: number;
  module_name: string;
  issued_at: string;
}

export function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutor' | 'market' | 'study' | 'certificates'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [roadmap, setRoadmap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedSkills, setRecommendedSkills] = useState<string | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  
  // Progress State
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [completedRoadmaps, setCompletedRoadmaps] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const filteredModules = MODULES.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(MODULES.map(m => m.category)))];

  const totalModules = MODULES.length;
  const progress = Math.round((completedModules.length / totalModules) * 100);

  // AI Tutor Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      const CACHE_KEY = 'eduai_recommended_skills';
      const CACHE_TIME_KEY = 'eduai_recommended_skills_time';
      const ONE_DAY = 24 * 60 * 60 * 1000;

      const cachedSkills = localStorage.getItem(CACHE_KEY);
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      const now = Date.now();

      // Use cache if it's fresh (less than 24 hours old)
      if (cachedSkills && cachedTime && (now - parseInt(cachedTime)) < ONE_DAY) {
        setRecommendedSkills(cachedSkills);
        setIsSkillsLoading(false);
        return;
      }

      setIsSkillsLoading(true);
      try {
        const skills = await getRecommendedSkills();
        if (skills) {
          setRecommendedSkills(skills);
          localStorage.setItem(CACHE_KEY, skills);
          localStorage.setItem(CACHE_TIME_KEY, now.toString());
        }
      } catch (error: any) {
        console.error("Failed to fetch skills", error);
        // If API fails but we have old cache, use it as fallback
        if (cachedSkills) {
          setRecommendedSkills(cachedSkills);
        } else {
          setRecommendedSkills("### 🚀 Trending Skills for 2026\n\nWe're currently experiencing high demand for our AI insights. Please check back in a few minutes for the latest trending skills in Web Development, AI, and Cloud Computing!");
        }
      } finally {
        setIsSkillsLoading(false);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [progressRes, certsRes] = await Promise.all([
          fetch(`/api/progress/${user.id}`),
          fetch(`/api/certificates/${user.id}`)
        ]);
        const progressData = await progressRes.json();
        const certsData = await certsRes.json();
        setCompletedModules(progressData);
        setCertificates(certsData);
        
        // Calculate completed roadmaps (all 3 modules done)
        const moduleIds = ['web-dev', 'data-ai', 'mobile', 'cloud'];
        let count = 0;
        moduleIds.forEach(id => {
          if (['m1', 'm2', 'm3'].every(step => progressData.includes(`${id}-${step}`))) {
            count++;
          }
        });
        setCompletedRoadmaps(count);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      }
    };
    fetchData();
  }, [user]);

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
    } catch (error: any) {
      console.error("Chat error", error);
      let errorMessage = "I'm having trouble connecting right now. Let's try again in a moment.";
      
      if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMessage = "I've been helping so many students today that I need a quick breather! 😅 Please try again in a few minutes, or explore our existing modules in the **Study Area** while I recharge.";
      }
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
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
            <span className="text-2xl font-black tracking-tighter gradient-text animate-gradient flex items-center gap-2">
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
          <SidebarItem 
            icon={<Award />} 
            label="My Certificates" 
            active={activeTab === 'certificates'} 
            onClick={() => setActiveTab('certificates')}
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
            <h2 className="text-xl font-bold capitalize tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
              {activeTab === 'overview' ? `Welcome back, ${user?.firstName || 'Student'}!` : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
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
                className="max-w-6xl mx-auto space-y-10"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight">Study Area</h2>
                      <p className="text-muted-foreground">Explore 200+ specialized technical modules.</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input 
                        type="text"
                        placeholder="Search modules..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 pr-6 py-3 bg-card border border-border rounded-2xl w-full sm:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-6 py-3 bg-card border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredModules.map(module => (
                    <StudyCard 
                      key={module.id}
                      id={module.id}
                      title={module.title}
                      description={module.description}
                      category={module.category}
                      isCompleted={completedModules.includes(module.id)}
                    />
                  ))}
                </div>

                {filteredModules.length === 0 && (
                  <div className="p-20 text-center bg-secondary/20 rounded-[40px] border-2 border-dashed border-border">
                    <p className="text-muted-foreground font-medium">No modules found matching your search.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'certificates' && (
              <motion.div
                key="certificates"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-pink-500/10 text-pink-500 rounded-2xl flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Certificates</h2>
                    <p className="text-muted-foreground">Your verified achievements and professional credentials.</p>
                  </div>
                </div>

                {certificates.length === 0 ? (
                  <div className="p-20 text-center bg-card border border-border rounded-[40px] space-y-6">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto">
                      <Award className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div className="max-w-sm mx-auto">
                      <h3 className="text-xl font-bold mb-2">No Certificates Yet</h3>
                      <p className="text-muted-foreground">Complete all modules in a study area to earn your first professional certificate.</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('study')}
                      className="px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-all"
                    >
                      Start Learning
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="bg-card border border-border p-8 rounded-[32px] shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                          <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <Award className="w-7 h-7" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Verified Achievement</span>
                          </div>
                          <div className="relative z-10">
                            <h3 className="text-2xl font-black tracking-tight mb-2">{cert.module_name}</h3>
                            <p className="text-sm text-muted-foreground mb-8">Issued on {new Date(cert.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <div className="flex gap-3">
                              <button 
                                onClick={() => setSelectedCertificate(cert)}
                                className="flex-1 py-4 bg-secondary text-foreground rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-accent transition-all"
                              >
                                <ExternalLink className="w-4 h-4" /> View Certificate
                              </button>
                              <button 
                                onClick={() => {
                                  const url = window.location.origin;
                                  const text = `I'm thrilled to share that I've just earned my professional certificate in ${cert.module_name} from EduAI! 🚀 Check it out: ${url} #EduAI #Learning #ProfessionalDevelopment #Chirag`;
                                  window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                              >
                                <Linkedin className="w-4 h-4" /> Share
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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

      {/* Certificate Preview Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-3xl"
            >
              <CertificateComponent 
                userName={user?.fullName || 'Student'} 
                moduleTitle={selectedCertificate.module_name} 
                date={new Date(selectedCertificate.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                onClose={() => setSelectedCertificate(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
    <div className="p-8 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={cn("p-3 rounded-2xl bg-secondary transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white", color)}>
          {icon}
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{trend}</span>
      </div>
      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <span className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/50">{value}</span>
      </div>
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

function StudyCard({ id, title, description, category, isCompleted }: { 
  id: string;
  title: string; 
  description: string; 
  category: string;
  isCompleted: boolean;
}) {
  return (
    <div className={cn(
      "p-8 rounded-[32px] bg-card border border-border shadow-sm flex flex-col h-full group hover:border-primary/50 transition-all relative overflow-hidden",
      isCompleted && "border-emerald-500/30 bg-emerald-500/5"
    )}>
      <div className="flex-1 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">{category}</span>
          {isCompleted && <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Completed ✓</span>}
        </div>
        <h3 className="text-xl font-black tracking-tight mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed line-clamp-2">{description}</p>
      </div>
      
      <div className="relative z-10">
        <Link 
          to={`/study-area/${id}`}
          className={cn(
            "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm",
            isCompleted 
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
              : "bg-primary text-white hover:scale-[1.02] shadow-lg shadow-primary/20"
          )}
        >
          {isCompleted ? "Review Material" : "Start Learning"} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-colors" />
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
