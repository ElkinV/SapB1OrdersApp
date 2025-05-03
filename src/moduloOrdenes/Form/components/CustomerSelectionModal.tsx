import React, { useState, KeyboardEvent } from 'react';
import {RefreshCw, Search, X} from 'lucide-react';
import { Customer } from "../../types.ts";
import {getToken, CONFIG} from "../../../utils/utils.ts";
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, listItem, staggerContainer } from '../../../utils/animations';



interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

const CustomerSelectionModal: React.FC<CustomerSelectionModalProps> = ({ isOpen, onClose, onSelectCustomer }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    setCustomers([]); // Limpiar resultados anteriores
    try {
      if (!searchTerm.trim()) return;
      const token = getToken();
      const response = await fetch(`http://${CONFIG.host}:3001/api/customers/list/?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('No se pudieron obtener los clientes');
      const data = await response.json();
      setCustomers(data.length ? data : []); // Asegurar que esté limpio si no hay resultados
    } catch (err) {
      setError(`Error al obtener los clientes. Verifica si el servidor está disponible. ${err}`);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') fetchCustomers();
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Lista de Socios de Negocios</h2>
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
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-4">
                <motion.input
                    type="text"
                    placeholder="Buscar clientes..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                />

                {searchTerm && (
                    <motion.button
                        onClick={() => setSearchTerm('')}
                        className="text-sm text-blue-500 hover:underline sm:whitespace-nowrap"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      Limpiar
                    </motion.button>
                )}

                <motion.button
                    type="button"
                    onClick={fetchCustomers}
                    disabled={!searchTerm.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 sm:flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                  <Search size={18} />
                  Buscar
                </motion.button>
              </div>

              {loading && (
                  <motion.div 
                    className="flex justify-center items-center py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500" />
                  </motion.div>
              )}

              {error && (
                  <motion.div 
                    className="text-center py-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                  >
                    <p className="text-red-500 mb-4">{error}</p>
                    <motion.button
                        onClick={fetchCustomers}
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
                    {customers.length > 0 && (
                        <motion.p 
                          className="text-sm text-gray-500 mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {customers.length} cliente(s) encontrado(s)
                        </motion.p>
                    )}
                    <motion.ul 
                      className="max-h-[40vh] overflow-y-auto rounded-lg divide-y divide-gray-100"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      <AnimatePresence>
                        {customers.length > 0 ? (
                            customers.map((customer) => (
                                <motion.li
                                    key={customer.id}
                                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                      onSelectCustomer(customer);
                                      onClose();
                                    }}
                                    variants={listItem}
                                    whileHover={{ x: 5 }}
                                >
                                  {customer.id} - {customer.name}
                                </motion.li>
                            ))
                        ) : (
                            <motion.li 
                              className="py-6 text-center text-gray-500 bg-gray-50 rounded-lg"
                              variants={listItem}
                            >
                              No se encontraron clientes
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

export default CustomerSelectionModal;
