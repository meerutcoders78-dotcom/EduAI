import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { Award, Download, Linkedin, Sparkles as SparklesIcon, X } from 'lucide-react';
import html2canvas from 'html2canvas';

interface CertificateProps {
  userName: string;
  moduleTitle: string;
  date: string;
  onClose?: () => void;
}

export function Certificate({ userName, moduleTitle, date, onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `EduAI-Certificate-${moduleTitle.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Download error", error);
    }
  };

  const handleShareLinkedIn = () => {
    const url = window.location.origin;
    const text = `I'm thrilled to share that I've just earned my professional certificate in ${moduleTitle} from EduAI! 🚀 This production-ready curriculum has been an incredible journey. Check it out: ${url} #EduAI #Learning #ProfessionalDevelopment #Chirag`;
    window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-card border border-border w-full max-w-3xl rounded-[48px] overflow-hidden shadow-2xl relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-3 hover:bg-secondary rounded-full transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>
      )}
      
      <div className="p-10 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-700 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-blue-700/40"
        >
          <Award className="w-10 h-10 text-white" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Congratulations!</h2>
          <p className="text-lg text-muted-foreground font-medium">You've officially mastered {moduleTitle}</p>
        </div>
        
        <div className="p-1 border-2 border-blue-500/20 rounded-[40px] bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <div 
            ref={certificateRef}
            className="aspect-[1.414/1] bg-white text-slate-900 p-10 flex flex-col items-center justify-center space-y-6 shadow-2xl relative overflow-hidden rounded-[38px]"
          >
            {/* Certificate Content - Professional Design */}
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700" />
            <div className="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700" />
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-700/5 rounded-full -ml-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-700/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900">EduAI</span>
            </div>

            <div className="space-y-1 text-center">
              <h3 className="text-3xl font-serif italic text-blue-800">Certificate of Excellence</h3>
              <p className="text-[8px] uppercase tracking-[0.5em] font-black text-slate-400">This professional credential is awarded to</p>
            </div>

            <p className="text-4xl font-black tracking-tight text-slate-900 border-b-2 border-slate-100 pb-2 min-w-[250px]">{userName}</p>
            
            <div className="space-y-1 text-center">
              <p className="text-xs text-slate-500 font-medium">for successfully completing the production-ready curriculum and mastering</p>
              <p className="text-2xl font-black text-blue-700 tracking-tight">{moduleTitle}</p>
            </div>

            <div className="pt-8 flex items-center gap-12">
              <div className="text-center">
                <div className="w-32 h-px bg-slate-200 mb-2" />
                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Date Issued</p>
                <p className="text-xs font-bold text-slate-700">{date}</p>
              </div>
              <div className="text-center">
                <div className="w-32 h-px bg-slate-200 mb-2" />
                <p className="text-[8px] font-bold uppercase text-slate-400 tracking-widest">Founder & Lead</p>
                <p className="text-xs font-bold text-slate-700">Chirag</p>
              </div>
            </div>
            
            <div className="absolute bottom-6 right-6 opacity-10">
              <Award className="w-24 h-24 text-blue-800" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handleDownloadImage}
              className="flex-1 sm:flex-none px-8 py-4 bg-secondary text-foreground rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent transition-all"
            >
              <Download className="w-4 h-4" /> Download
            </button>
            <button 
              onClick={handleShareLinkedIn}
              className="flex-1 sm:flex-none px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
            >
              <Linkedin className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium">Your certificate is securely stored in your dashboard.</p>
      </div>
    </div>
  );
}
