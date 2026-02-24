import { motion } from 'motion/react';

export function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl"
    >
      <div className="relative">
        {/* Animated background glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="relative flex flex-col items-center"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter gradient-text animate-pulse">
            Edu AI
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mt-2 rounded-full"
          />
          <p className="mt-4 text-muted-foreground font-medium tracking-widest uppercase text-xs">
            Preparing your future
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
