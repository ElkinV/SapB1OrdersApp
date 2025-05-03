import React, { useState, KeyboardEvent } from 'react';
import { X, RefreshCw, Search, ThermometerSnowflake } from 'lucide-react';
import Loader from "../../components/Loader.tsx"
import { Item } from "../../types.ts"
import {getToken, CONFIG} from "../../../utils/utils.ts";
import {toast} from "react-toastify";
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, listItem, staggerContainer } from '../../../utils/animations';


interface ItemSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: Item) => void;
}

const ItemSelectionModal: React.FC<ItemSelectionModalProps> = ({ isOpen, onClose, onSelectItem }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const token = getToken()

      const response = await fetch(`http://${CONFIG.host}:3001/api/items/?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('No autorizado. Inicia sesión nuevamente.');
        }
        toast.error('No se pudieron obtener los artículos.');
      }

      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener los artículos.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = async(e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter')  await fetchItems();
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 z-50">
        <motion.div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Listado de Artículos
              </h2>
              <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex flex-col sm:flex-row gap-2 mb-4 items-stretch sm:items-center">
                <motion.input
                    type="text"
                    placeholder="Buscar artículos"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                />
                <motion.button
                    type="button"
                    onClick={fetchItems}
                    disabled={!searchTerm.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  <Search size={18} />
                  Buscar
                </motion.button>
                {searchTerm && (
                    <motion.button
                        onClick={() => setSearchTerm('')}
                        className="text-sm text-blue-500 hover:underline whitespace-nowrap"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      Limpiar
                    </motion.button>
                )}
              </div>

              {loading && <Loader />}

              {error && (
                  <motion.div 
                    className="text-center py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <p className="text-red-500 mb-4">{error}</p>
                    <motion.button
                        onClick={fetchItems}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center mx-auto gap-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw size={18} />
                      Reintentar
                    </motion.button>
                  </motion.div>
              )}

              {!loading && !error && (
                  <>
                    {items.length > 0 && (
                        <motion.p 
                          className="text-sm text-gray-500 mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {items.length} artículo(s) encontrado(s)
                        </motion.p>
                    )}
                    <motion.ul 
                      className="max-h-[40vh] overflow-y-auto rounded-lg divide-y divide-gray-100"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence>
                        {items.length > 0 ? (
                            items.map((item) => (
                                <motion.li
                                    key={item.itemCode}
                                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      onSelectItem(item);
                                      onClose();
                                    }}
                                    variants={listItem}
                                    whileHover={{ x: 5 }}
                                >
                                  <span>
                                    {item.isRefrigerado && (
                                        <ThermometerSnowflake className="inline ml-1 text-blue-500" />
                                    )}
                                    {item.itemCode} - {item.name}
                                  </span>
                                </motion.li>
                            ))
                        ) : (
                            <motion.li 
                              className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg"
                              variants={listItem}
                            >
                              No se encontraron artículos
                            </motion.li>
                        )}
                      </AnimatePresence>
                    </motion.ul>
                  </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
  );

};

export default ItemSelectionModal;
