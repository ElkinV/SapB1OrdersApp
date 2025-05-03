import React from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'dots' | 'pulse';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Cargando...', 
  type = 'spinner' 
}) => {
  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <motion.div
            className="w-8 h-8 bg-blue-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          />
        );
      default:
        return (
          <motion.div
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {renderLoader()}
      {message && (
        <motion.p
          className="mt-4 text-gray-600 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingState; 