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
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadImage = async () => {
    if (!certificateRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      
      // Use dom-to-image-more for better modern CSS support
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: 1200,
        height: 848,
        style: {
          transform: 'none',
          margin: '0',
          padding: '0',
          borderRadius: '0',
          boxShadow: 'none',
          display: 'flex',
          visibility: 'visible',
          opacity: '1'
        }
      });

      const link = document.createElement('a');
      link.download = `AbilitiesAI-Certificate-${moduleTitle.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Primary download error", error);
      // Fallback to html2canvas if dom-to-image-more fails
      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('certificate-capture');
            if (el) el.style.display = 'flex';
          }
        });

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `AbilitiesAI-Certificate-${moduleTitle.replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error("Fallback download error", fallbackError);
        alert("Unable to download certificate. Please try again or take a screenshot.");
      }
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
          <h2 className="text-2xl sm:text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Congratulations!</h2>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium">You've officially mastered {moduleTitle}</p>
        </div>
        
        <div className="p-0.5 sm:p-1 border-2 border-blue-500/20 rounded-[24px] sm:rounded-[40px] bg-gradient-to-br from-blue-500/5 to-purple-500/5 overflow-hidden">
          <div 
            ref={certificateRef}
            id="certificate-capture"
            className="aspect-[1.414/1] bg-white text-slate-900 p-4 sm:p-10 flex flex-col items-center justify-center space-y-3 sm:space-y-6 shadow-2xl relative overflow-hidden rounded-[22px] sm:rounded-[38px]"
          >
            {/* Certificate Content - Professional Design */}
            <div className="absolute top-0 left-0 w-full h-1.5 sm:h-3 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700" />
            <div className="absolute bottom-0 left-0 w-full h-1.5 sm:h-3 bg-gradient-to-r from-blue-700 via-blue-600 to-purple-700" />
            <div className="absolute top-0 left-0 w-16 h-16 sm:w-32 sm:h-32 bg-blue-700/5 rounded-full -ml-8 -mt-8 sm:-ml-16 sm:-mt-16 blur-xl sm:blur-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-purple-700/5 rounded-full -mr-8 -mb-8 sm:-mr-16 sm:-mb-16 blur-xl sm:blur-2xl" />
            
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-5 h-5 sm:w-8 sm:h-8 bg-blue-700 rounded-md sm:rounded-lg flex items-center justify-center">
                <Box className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-sm sm:text-xl font-black tracking-tighter text-slate-900">Abilities AI</span>
            </div>

            <div className="space-y-0.5 sm:space-y-1 text-center">
              <h3 className="text-lg sm:text-3xl font-serif italic text-blue-800">Certificate of Excellence</h3>
              <p className="text-[5px] sm:text-[8px] uppercase tracking-[0.3em] sm:tracking-[0.5em] font-black text-slate-400">This professional credential is awarded to</p>
            </div>

            <p className="text-xl sm:text-4xl font-black tracking-tight text-slate-900 border-b border-slate-100 pb-1 sm:pb-2 min-w-[150px] sm:min-w-[250px]">{userName}</p>
            
            <div className="space-y-0.5 sm:space-y-1 text-center max-w-[90%]">
              <p className="text-[6px] sm:text-xs text-slate-500 font-medium">for successfully completing the production-ready curriculum and mastering</p>
              <p className="text-sm sm:text-2xl font-black text-blue-700 tracking-tight">{moduleTitle}</p>
            </div>

            <div className="pt-4 sm:pt-8 flex items-center gap-6 sm:gap-12">
              <div className="text-center">
                <div className="w-16 sm:w-32 h-px bg-slate-200 mb-1 sm:mb-2" />
                <p className="text-[5px] sm:text-[8px] font-bold uppercase text-slate-400 tracking-widest">Date Issued</p>
                <p className="text-[8px] sm:text-xs font-bold text-slate-700">{date}</p>
              </div>
              <div className="text-center">
                <div className="w-16 sm:w-32 h-px bg-slate-200 mb-1 sm:mb-2" />
                <p className="text-[5px] sm:text-[8px] font-bold uppercase text-slate-400 tracking-widest">Founder & Lead</p>
                <p className="text-[8px] sm:text-xs font-bold text-slate-700 font-serif italic">Chirag Tankan</p>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 opacity-5 sm:opacity-10">
              <Award className="w-12 h-12 sm:w-24 sm:h-24 text-blue-800" />
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
