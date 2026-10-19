import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const ProgressBar = ({ percentage, label, used, total }) => {
  const [progress, setProgress] = useState(0);
  const springProgress = useSpring(progress, {
    stiffness: 100,
    damping: 20,
  });

  useEffect(() => {
    setProgress(percentage);
  }, [percentage]);

  const getColor = (percent) => {
    if (percent < 50) return 'from-emerald-500 to-teal-400';
    if (percent < 80) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          {used} / {total}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${getColor(percentage)}`}
            style={{ 
              width: springProgress,
              originX: 0,
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut"
            }}
            animate={{ scaleX: progress / 100 }}
          />
          
          {/* Animated dots */}
          <motion.div
            className="absolute top-0 h-full w-2 bg-white/30"
            animate={{ 
              x: ['0%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
        
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">0%</span>
          <span className="text-xs text-gray-500">50%</span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
      </div>
      
      {/* Storage breakdown */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {['Documents', 'Images', 'Videos', 'Other'].map((type, index) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-1" 
                 style={{ width: `${20 + index * 15}%` }} />
            <span className="text-xs text-gray-600 dark:text-gray-400">{type}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;