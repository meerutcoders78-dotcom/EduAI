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

  const [certScale, setCertScale] = useState(0.5);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update scale based on container width
  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const newScale = Math.min(containerWidth / 1200, 1);
        setCertScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleDownloadImage = async () => {
    if (!certificateRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const element = certificateRef.current;
      
      // Use html2canvas for more reliable rendering of standard layouts
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 1200,
        height: 848,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-cert-container]') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.margin = '0';
          }
          // Remove any potential debug borders that might be showing up from global styles
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              // Force reset borders that aren't explicitly defined in the component
              const style = window.getComputedStyle(el);
              if (style.borderStyle === 'none' || style.borderWidth === '0px') {
                el.style.border = 'none';
                el.style.outline = 'none';
              }
            }
          });
        }
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `AbilitiesAI-Certificate-${moduleTitle.replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download error", error);
      alert("Unable to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const displayName = userName || "Master Student";

  return (
    <div className="bg-card border border-border w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl relative mx-4 sm:mx-0">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors z-50"
        >
          <X className="w-5 h-5 sm:w-6 h-6" />
        </button>
      )}
      
      <div className="p-4 sm:p-8 text-center space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-primary">Congratulations!</h2>
          <p className="text-sm sm:text-base text-muted-foreground font-medium">You've officially mastered {moduleTitle}</p>
        </div>
        
        {/* Certificate Preview Container */}
        <div ref={containerRef} className="relative border-4 border-primary/10 rounded-[24px] overflow-hidden bg-slate-50 w-full">
          <div 
            ref={certificateRef}
            data-cert-container
            className="relative bg-white overflow-hidden select-none"
            style={{ 
              width: '1200px', 
              height: '848px', 
              transform: `scale(${certScale})`, 
              transformOrigin: 'top left',
              marginBottom: `-${848 * (1 - certScale)}px`
            }}
          >
            {/* ================= DECORATIVE BORDER ================= */}
            <div className="absolute inset-8 border-8 border-double border-primary/20 rounded-lg" />
            <div className="absolute inset-12 border border-primary/10 rounded-sm" />

            {/* ================= CORNER ACCENTS ================= */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-br-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-tr-full -translate-x-1/2 translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-primary/5 rounded-tl-full translate-x-1/2 translate-y-1/2" />

            {/* ================= TOP LOGO ================= */}
            <div className="absolute top-20 left-0 right-0 flex flex-col items-center gap-2 z-20">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Award className="w-10 h-10 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Abilities AI</span>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center pt-24 px-24">
              {/* Heading */}
              <div className="mb-12">
                <h1 className="text-slate-900 text-6xl font-black tracking-tight mb-2">
                  CERTIFICATE
                </h1>
                <div className="flex items-center gap-4">
                  <div className="h-px w-12 bg-primary/30" />
                  <p className="text-primary font-bold tracking-[0.3em] uppercase text-lg">
                    OF COMPLETION
                  </p>
                  <div className="h-px w-12 bg-primary/30" />
                </div>
              </div>

              <p className="text-slate-500 text-xl font-medium mb-8 italic">
                This is to certify that
              </p>

              {/* Name */}
              <h2 className="text-slate-900 text-6xl font-black tracking-tight mb-8 border-b-4 border-primary/10 pb-4 min-w-[600px]">
                {displayName}
              </h2>

              {/* Description */}
              <div className="max-w-3xl space-y-4 mb-12">
                <p className="text-slate-500 text-xl leading-relaxed">
                  has successfully completed all requirements for the professional course in
                </p>
                <p className="text-primary text-4xl font-black tracking-tight">
                  {moduleTitle}
                </p>
              </div>

              {/* ================= FOOTER ================= */}
              <div className="w-full flex justify-between items-end mt-auto pb-20 px-16">
                {/* Date */}
                <div className="text-left">
                  <p className="text-slate-900 text-xl font-bold border-b-2 border-slate-200 pb-1 mb-2">
                    {date}
                  </p>
                  <p className="text-slate-400 text-xs tracking-widest uppercase font-bold">
                    Date of Issue
                  </p>
                </div>

                {/* Badge */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center">
                      <Box className="w-12 h-12 text-primary/40" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-tighter">
                    Verified Credential
                  </div>
                </div>

                {/* Signature */}
                <div className="text-right">
                  <p
                    className="text-primary text-4xl leading-none mb-2"
                    style={{ fontFamily: "'Pacifico', cursive" }}
                  >
                    Abilities AI
                  </p>
                  <p className="text-slate-900 text-xl font-bold border-t-2 border-slate-200 pt-1 mt-2">
                    Certification Board
                  </p>
                  <p className="text-slate-400 text-xs tracking-widest uppercase font-bold">
                    Official Authority
                  </p>
                </div>
              </div>
            </div>
            
            {/* Watermark */}
            <div className="absolute bottom-16 right-1/2 translate-x-1/2 opacity-5 pointer-events-none">
              <Award className="w-96 h-96 text-white" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={handleDownloadImage}
            disabled={isDownloading}
            className="w-full sm:w-auto px-12 py-4 bg-primary text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" /> Download Certificate
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium">Your certificate is high-resolution and ready for printing or sharing.</p>
      </div>
    </div>
  );
}
