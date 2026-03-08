import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Download, Box, X, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import domtoimage from 'dom-to-image-more';

interface CertificateProps {
  userName: string;
  moduleTitle: string;
  date: string;
  onClose?: () => void;
}

export function Certificate({ userName, moduleTitle, date, onClose }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadImage = async () => {
    if (!certificateRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      
      // Use dom-to-image-more which handles modern CSS better than html2canvas
      // We use a high-quality PNG export
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1.0,
        width: 1200,
        height: 848,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      const link = document.createElement('a');
      link.download = `AbilitiesAI-Certificate-${moduleTitle.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error", error);
      alert("Unable to download certificate. Please try again or take a screenshot.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-card border border-border w-full max-w-3xl rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl relative mx-4 sm:mx-0">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 hover:bg-secondary rounded-full transition-colors z-50"
        >
          <X className="w-5 h-5 sm:w-6 h-6" />
        </button>
      )}
      
      <div className="p-6 sm:p-10 text-center space-y-6 sm:space-y-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-700 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4 shadow-2xl shadow-blue-700/40"
        >
          <Award className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </motion.div>
        
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tighter text-primary">Congratulations!</h2>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium">You've officially mastered {moduleTitle}</p>
        </div>
        
        <div className="p-0.5 sm:p-1 border-2 border-blue-500/20 rounded-[24px] sm:rounded-[40px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 overflow-hidden">
          <div 
            ref={certificateRef}
            id="certificate-capture"
            className="aspect-[1.414/1] bg-gradient-to-br from-[#1e3a8a] via-[#3b0764] to-[#1e3a8a] text-white p-4 sm:p-10 flex flex-col items-center justify-center space-y-3 sm:space-y-6 shadow-2xl relative overflow-hidden rounded-[22px] sm:rounded-[38px]"
          >
            {/* Certificate Content - Royal Design */}
            <div className="absolute top-0 left-0 w-full h-1.5 sm:h-3 bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400 opacity-80" />
            <div className="absolute bottom-0 left-0 w-full h-1.5 sm:h-3 bg-gradient-to-r from-blue-400 via-blue-200 to-purple-400 opacity-80" />
            
            {/* Decorative Ornaments */}
            <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-8 h-8 sm:w-16 sm:h-16 border-t-2 border-l-2 border-blue-300/30 rounded-tl-2xl" />
            <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-8 h-8 sm:w-16 sm:h-16 border-t-2 border-r-2 border-blue-300/30 rounded-tr-2xl" />
            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-8 h-8 sm:w-16 sm:h-16 border-b-2 border-l-2 border-blue-300/30 rounded-bl-2xl" />
            <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-8 h-8 sm:w-16 sm:h-16 border-b-2 border-r-2 border-blue-300/30 rounded-br-2xl" />

            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-6 h-6 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg flex items-center justify-center">
                <Box className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-sm sm:text-2xl font-black tracking-tighter text-white">Abilities AI</span>
            </div>

            <div className="space-y-0.5 sm:space-y-2 text-center">
              <h3 className="text-xl sm:text-4xl font-serif italic text-blue-100">Certificate of Excellence</h3>
              <p className="text-[5px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] font-black text-blue-200/60">This professional credential is awarded to</p>
            </div>

            <p className="text-2xl sm:text-5xl font-black tracking-tight text-white border-b border-white/20 pb-1 sm:pb-3 min-w-[180px] sm:min-w-[350px] text-center">{userName}</p>
            
            <div className="space-y-0.5 sm:space-y-2 text-center max-w-[90%]">
              <p className="text-[6px] sm:text-sm text-blue-100/70 font-medium">for successfully completing the production-ready curriculum and mastering</p>
              <p className="text-sm sm:text-3xl font-black text-white tracking-tight">{moduleTitle}</p>
            </div>

            <div className="pt-4 sm:pt-10 flex items-center gap-8 sm:gap-20">
              <div className="text-center">
                <div className="w-20 sm:w-40 h-px bg-white/20 mb-1 sm:mb-3" />
                <p className="text-[5px] sm:text-[10px] font-bold uppercase text-blue-200/40 tracking-widest">Date Issued</p>
                <p className="text-[8px] sm:text-sm font-bold text-white">{date}</p>
              </div>
              <div className="text-center">
                <div className="w-20 sm:w-40 h-px bg-white/20 mb-1 sm:mb-3" />
                <p className="text-[5px] sm:text-[10px] font-bold uppercase text-blue-200/40 tracking-widest">Founder & Lead</p>
                <p className="text-[8px] sm:text-sm font-bold text-white font-serif italic">Chirag Tankan</p>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 sm:bottom-10 sm:right-10 opacity-10">
              <Award className="w-16 h-16 sm:w-32 sm:h-32 text-white" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
          <button 
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-primary text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download Certificate
              </>
            )}
          </button>
        </div>
        
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">Your certificate is securely stored in your dashboard.</p>
      </div>
    </div>
  );
}
