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
      
      // Use dom-to-image-more for high-quality SVG-based capture
      // We force the scale to 1 for the capture
      const dataUrl = await domtoimage.toPng(element, {
        quality: 1.0,
        width: 1200,
        height: 848,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          margin: '0',
          padding: '0'
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

  const displayName = userName || "<First Last>";

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
        <div ref={containerRef} className="relative border-4 border-blue-500/10 rounded-[24px] overflow-hidden bg-[#0b1622] w-full">
          <div 
            ref={certificateRef}
            className="relative bg-[#0b1622] overflow-hidden select-none"
            style={{ 
              width: '1200px', 
              height: '848px', 
              transform: `scale(${certScale})`, 
              transformOrigin: 'top left',
              marginBottom: `-${848 * (1 - certScale)}px`
            }}
          >
            {/* ================= CORNER BORDERS ================= */}
            <div className="absolute top-8 left-8 w-24 h-24 border-l-4 border-t-4 border-[#00d4ff]/80 rounded-tl-2xl" />
            <div className="absolute top-8 right-8 w-24 h-24 border-r-4 border-t-4 border-[#00d4ff]/80 rounded-tr-2xl" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border-l-4 border-b-4 border-[#00d4ff]/80 rounded-bl-2xl" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-r-4 border-b-4 border-[#00d4ff]/80 rounded-br-2xl" />

            {/* ================= TOP LOGO ================= */}
            <div className="absolute top-12 left-0 right-0 flex justify-center items-center gap-3 z-20">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center">
                <Box className="w-8 h-8 text-[#00d4ff]" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-white">Abilities AI</span>
            </div>

            {/* ================= MAIN CONTENT ================= */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center pt-16">
              {/* Heading */}
              <div className="mb-10">
                <h1 className="text-[#00d4ff] text-7xl font-extrabold tracking-tight">
                  CERTIFICATE
                </h1>
                <p className="text-white/60 tracking-[0.4em] uppercase mt-3 text-xl font-bold">
                  Of Excellence
                </p>
              </div>

              <p className="text-white/80 text-2xl mb-8">
                This professional credential is proudly presented to
              </p>

              {/* Name */}
              <h2 className="text-[#c7ff4d] text-6xl font-black italic tracking-wide uppercase mb-10 border-b-2 border-[#c7ff4d]/20 pb-4 min-w-[500px]">
                {displayName}
              </h2>

              {/* Description */}
              <div className="max-w-4xl space-y-4">
                <p className="text-white/70 text-xl leading-relaxed">
                  for successfully completing the production-ready curriculum and mastering
                </p>
                <p className="text-[#00d4ff] text-4xl font-black tracking-tight uppercase">
                  {moduleTitle}
                </p>
              </div>

              {/* ================= SPONSOR ================= */}
              <div className="mt-12 flex flex-col items-center gap-4">
                <p className="text-white/40 text-sm tracking-[0.3em] uppercase font-bold">
                  Sponsored By
                </p>
                <div className="flex items-center gap-4">
                  <img
                    src="https://json.commudle.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBLy9YQkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--0f09813e6aa3dc3e732cca755614d3bbadd5bf5f/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDRG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFKQUFXa0NRQUU2QzJ4dllXUmxjbnNHT2dsd1lXZGxNQT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--e1b8c3103b542b9d7ba47b2862e0d51860fbef22/Screenshot%202025-08-15%20114940.png"
                    alt="Meerut Coders Logo"
                    className="h-16 object-contain opacity-90"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                  <div className="h-12 w-px bg-white/20 mx-2" />
                  <p className="text-[#00d4ff] text-2xl font-black tracking-tighter">
                    Meerut Coders
                  </p>
                </div>
              </div>

              {/* ================= FOOTER ================= */}
              <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end">
                {/* Date */}
                <div className="text-left">
                  <div className="w-56 h-[1px] bg-[#00d4ff]/40 mb-3" />
                  <p className="text-white/40 text-xs tracking-widest uppercase font-bold mb-1">
                    Date Issued
                  </p>
                  <p className="text-white text-lg font-bold">
                    {date}
                  </p>
                </div>

                {/* Signature */}
                <div className="text-right">
                  <p
                    className="text-[#c7ff4d] text-4xl leading-none mb-2"
                    style={{ fontFamily: "'Brush Script MT', 'Pacifico', cursive" }}
                  >
                    Chirag Tankan
                  </p>
                  <div className="w-56 h-[1px] bg-[#00d4ff]/40 mb-3 ml-auto" />
                  <p className="text-[#00d4ff] font-black text-lg tracking-tighter">
                    Chirag Tankan
                  </p>
                  <p className="text-white/40 text-xs tracking-widest uppercase font-bold">
                    Founder & Lead
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
