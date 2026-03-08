import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  Award,
  ChevronRight,
  PlayCircle,
  Code,
  Share2,
  Sparkles as SparklesIcon,
  Rocket,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { GoogleGenAI, Type } from '@google/genai';
import { cn } from '../lib/utils';
import { MODULES } from '../constants/modules';
import { Certificate } from './Certificate';
import { storageService } from '../services/storageService';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ModulePageContent {
  pages: {
    title: string;
    content: string;
  }[];
}

export function ModulePage() {
  const { moduleId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [moduleContent, setModuleContent] = useState<ModulePageContent | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [installProgress, setInstallProgress] = useState(0);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [isMarking, setIsMarking] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const moduleInfo = MODULES.find(m => m.id === moduleId) || MODULES[0];

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setInstallProgress(0);
      
      // Simulate installation progress
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);

      // Check cache first
      const CACHE_KEY = `eduai_module_content_${moduleId}`;
      const cachedContent = localStorage.getItem(CACHE_KEY);
      if (cachedContent) {
        try {
          const data = JSON.parse(cachedContent);
          setModuleContent(data);
          setInstallProgress(100);
          setTimeout(() => setIsLoading(false), 800);
          clearInterval(interval);
          return;
        } catch (e) {
          localStorage.removeItem(CACHE_KEY);
        }
      }

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate a professional, highly interactive 10-page technical curriculum for the topic: "${moduleInfo.title}".
          
          Guidelines for Content:
          1. Use Markdown formatting extensively (headers, bold text, code blocks).
          2. Use bullet points and numbered lists to break down complex information.
          3. Incorporate relevant emojis to make the content engaging and interactive.
          4. Ensure the content is "production-ready", highly detailed, and follows industry best practices.
          5. Each page must be a deep dive into a specific sub-topic.
          6. At least 10 pages are required.
          
          Format the output as a JSON object with a "pages" array. Each page object must have "title" and "content" (Markdown string).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                pages: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING }
                    },
                    required: ["title", "content"]
                  }
                }
              },
              required: ["pages"]
            }
          }
        });
        
        const data = JSON.parse(response.text || '{"pages": []}');
        setModuleContent(data);
        // Cache the result
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
          // If storage is full, clear all module caches and try again
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('eduai_module_content_')) {
              localStorage.removeItem(key);
            }
          });
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
        }
        setInstallProgress(100);
      } catch (error: any) {
        console.error("Failed to fetch module content", error);
        if (error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED')) {
          setError("Our AI servers are currently busy helping other students. Please try again in a few minutes.");
        } else {
          setError("Failed to install module. Please try again.");
        }
      } finally {
        clearInterval(interval);
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    const fetchProgress = () => {
      if (!user) return;
      try {
        const data = storageService.getProgress(user.id);
        setCompletedModules(data);
      } catch (err) {
        console.error("Failed to fetch progress", err);
      }
    };

    fetchContent();
    fetchProgress();
  }, [moduleId, user]);

  // Handle scroll to bottom for auto-completion
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || isLoading || !moduleContent) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // If we are on the last page and scrolled to bottom
      if (currentPage === moduleContent.pages.length - 1) {
        if (scrollHeight - scrollTop <= clientHeight + 50) {
          if (!completedModules.includes(moduleId!)) {
            handleCompleteModule();
          } else {
            // Already completed, just show the certificate modal
            setShowCertificateModal(true);
          }
        }
      }
    };

    const currentScrollRef = scrollRef.current;
    currentScrollRef?.addEventListener('scroll', handleScroll);
    return () => currentScrollRef?.removeEventListener('scroll', handleScroll);
  }, [currentPage, moduleContent, isLoading, completedModules]);

  const handleCompleteModule = async () => {
    if (!user || isMarking || !moduleId) return;
    setIsMarking(true);
    
    try {
      storageService.saveProgress(user.id, moduleId);
      setCompletedModules(prev => [...prev, moduleId]);
      handleIssueCertificate();
    } catch (error) {
      console.error("Failed to save progress", error);
    } finally {
      setIsMarking(false);
    }
  };

  const handleIssueCertificate = async () => {
    if (!user) return;
    
    try {
      const result = storageService.issueCertificate(user.id, moduleInfo.title);

      if (result.success) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#ec4899']
        });
        setShowCertificateModal(true);
      } else {
        setError("Failed to issue certificate.");
        // Show error briefly
        setTimeout(() => setError(null), 5000);
      }
    } catch (error) {
      console.error("Certificate error", error);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 selection:bg-primary/20">
      {/* Header */}
      <header className="h-20 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{moduleInfo.title}</h1>
            <p className="text-xs text-muted-foreground font-medium">Production-Ready Curriculum</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Module Progress</span>
            <div className="w-32 h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentPage + 1) / (moduleContent?.pages.length || 1)) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500" 
              />
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold">Page {currentPage + 1} of {moduleContent?.pages.length || 10}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pt-10 max-w-5xl">
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl text-sm font-bold flex items-center gap-3"
            >
              <X className="w-5 h-5" /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-10">
            <div className="relative w-32 h-32">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Rocket className="w-10 h-10 text-primary animate-bounce" />
              </div>
            </div>
            <div className="text-center space-y-4 max-w-sm">
              <h2 className="text-3xl font-black tracking-tighter">Installing Module...</h2>
              <p className="text-muted-foreground font-medium">Configuring technical curriculum and production guides for {moduleInfo.title}.</p>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${installProgress}%` }}
                  className="h-full bg-primary"
                />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{Math.round(installProgress)}% Complete</p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_300px] gap-10">
            {/* Content */}
            <div className="space-y-10">
              <section className="bg-card border border-border rounded-[32px] p-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">{moduleInfo.category}</span>
                    <span className="text-xs text-muted-foreground font-medium">Page {currentPage + 1}</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter mb-6 gradient-text animate-gradient">
                    {moduleContent?.pages[currentPage].title}
                  </h2>
                </div>
              </section>

              <div 
                ref={scrollRef}
                className="bg-card border border-border rounded-[32px] p-10 shadow-sm markdown-body prose prose-slate dark:prose-invert max-w-none h-[600px] overflow-y-auto custom-scrollbar"
              >
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Markdown>{moduleContent?.pages[currentPage].content}</Markdown>
                </motion.div>
                
                {currentPage === (moduleContent?.pages.length || 0) - 1 && (
                  <div className="mt-20 p-8 border-2 border-dashed border-emerald-500/20 rounded-3xl bg-emerald-500/5 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-emerald-600 mb-2">Final Step Reached</h3>
                    <p className="text-sm text-muted-foreground">Scroll to the very bottom to complete this module and earn your certificate.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between bg-card border border-border p-6 rounded-[28px] shadow-sm">
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(0, prev - 1));
                    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === 0}
                  className="px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-secondary transition-all disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" /> Previous Page
                </button>
                
                <div className="flex items-center gap-2">
                  {moduleContent?.pages.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        i === currentPage ? "w-6 bg-primary" : "bg-secondary"
                      )} 
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (currentPage < (moduleContent?.pages.length || 0) - 1) {
                      setCurrentPage(prev => prev + 1);
                      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={currentPage === (moduleContent?.pages.length || 0) - 1}
                  className="px-6 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  Next Page <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-8">
              <div className="bg-card border border-border rounded-[32px] p-8 shadow-sm sticky top-28 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h3 className="text-xl font-bold mb-8 flex items-center gap-3 relative z-10">
                  <Code className="w-6 h-6 text-primary" /> Resources
                </h3>
                <div className="space-y-4 relative z-10">
                  {moduleInfo.resources.map((res, i) => (
                    <a 
                      key={i}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-5 bg-secondary/50 rounded-2xl hover:bg-primary hover:text-white transition-all group"
                    >
                      <span className="text-sm font-bold">{res.name}</span>
                      <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>

                <div className="mt-10 p-6 bg-primary/5 rounded-[24px] border border-primary/10 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Module Status</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    {completedModules.includes(moduleId!) 
                      ? "You have successfully completed this module and earned your certificate." 
                      : "Read through all 10 pages and scroll to the bottom of the last page to complete."}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-3xl"
            >
              <Certificate 
                userName={user?.fullName || 'Student'} 
                moduleTitle={moduleInfo.title} 
                date={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                onClose={() => setShowCertificateModal(false)}
              />
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/30"
                >
                  Back to Dashboard <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
