import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Plus, List, Home, HelpCircle } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    {
      key: 'Alt + N',
      description: 'Crear nueva orden',
      icon: <Plus className="w-4 h-4" />
    },
    {
      key: 'Ctrl + L',
      description: 'Ver listado de órdenes',
      icon: <List className="w-4 h-4" />
    },
    {
      key: 'Ctrl + H',
      description: 'Ir a inicio',
      icon: <Home className="w-4 h-4" />
    },
    {
      key: 'Ctrl + G',
      description: 'Abrir guía del sistema',
      icon: <HelpCircle className="w-4 h-4" />
    }
  ];

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleClose}
      >
        <motion.div 
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={handleModalClick}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Keyboard className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold text-gray-900">Atajos de Teclado</h2>
            </motion.div>
            <motion.button
              onClick={handleClose}
              className="rounded-lg p-2 hover:bg-gray-100 transition-all relative z-10"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <X className="text-gray-500" size={24} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: 0.4 + index * 0.1,
                    type: "spring", 
                    stiffness: 400, 
                    damping: 17 
                  }}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="p-2 bg-blue-100 rounded-lg"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {shortcut.icon}
                    </motion.div>
                    <span className="text-gray-700">{shortcut.description}</span>
                  </div>
                  <motion.div
                    className="px-3 py-1 bg-gray-200 rounded-md text-sm font-medium text-gray-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {shortcut.key}
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="mt-6 p-4 bg-blue-50 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm text-blue-700">
                Estos atajos te ayudarán a navegar más rápido por el sistema. Recuerda que puedes acceder a esta lista en cualquier momento desde el menú lateral.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal; 