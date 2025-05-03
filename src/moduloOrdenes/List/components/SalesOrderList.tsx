import React, { useEffect, useState, ChangeEvent } from 'react';
import { SalesOrder } from '../../types.ts';
import { CheckCircle, Clock4, FileText, Hash, UserCircle, Search } from "lucide-react";
import DetailsModal from "./detailsModal.tsx";
import {CONFIG, getToken} from "../../../utils/utils.ts"
import { motion, AnimatePresence } from 'framer-motion';


interface SalesOrderListProps {
  userId: string | null;
  refresh: number;
  onModalClose?: () => void;
}

interface OrderGroup {
  status: string;
  orders: SalesOrder[];
}

const SalesOrderList: React.FC<SalesOrderListProps> = ({ userId,  refresh }) => {
  const [allSalesOrders, setAllSalesOrders] = useState<SalesOrder[]>([]);
  const [groupedOrders, setGroupedOrders] = useState<OrderGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState(''); // <-- Filtro por tipo de documento
  const [selectedCardCode, setSelectedCardCode] = useState<number | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const handleSelectCardCode = (cardCode: number) => {
    setSelectedCardCode(cardCode);
    setIsDetailsModalOpen(true);
  };



  const fetchOrders = async () => {
    if (!userId) return;
    try {
      setError(null);
      const token = getToken();
      const response = await fetch(`http://${CONFIG.host}:3001/api/orders/list?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Error al cargar las órdenes');
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido');
      }
      
      setAllSalesOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar las órdenes');
      setAllSalesOrders([]);
    }
  };

  useEffect(() => {
    if (shouldRefresh) {
      fetchOrders().then(() => setShouldRefresh(false));
    }
  }, [refresh, shouldRefresh]);

  useEffect(() => {
    if (Array.isArray(allSalesOrders)) {
      applyFiltersAndGroup();
    }
  }, [allSalesOrders, searchQuery, startDate, endDate, statusFilter, docTypeFilter]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  const handleDocTypeFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDocTypeFilter(event.target.value);
  };



  const applyFiltersAndGroup = () => {
    if (!Array.isArray(allSalesOrders)) {
      setGroupedOrders([]);
      return;
    }

    let filtered = [...allSalesOrders];

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
          (order) =>
              order.customerName.toLowerCase().includes(lowerCaseQuery) ||
              order.docNum.toString().includes(lowerCaseQuery) ||
              order.cardCode.toString().includes(lowerCaseQuery)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((order) => new Date(order.date) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter((order) => new Date(order.date) < end);
    }

    if (statusFilter) {
      filtered = filtered.filter((order) => order.docStatus === statusFilter);
    }

    if (docTypeFilter) {
      filtered = filtered.filter((order) => order.series.toString() === docTypeFilter);
    }

    const grouped: { [key: string]: SalesOrder[] } = filtered.reduce((acc, order) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      acc[order.docStatus] = acc[order.docStatus] || [];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      acc[order.docStatus].push(order);
      return acc;
    }, {});

    const groupedArray: OrderGroup[] = Object.keys(grouped).map(status => ({
      status,
      orders: grouped[status]
    }));

    groupedArray.sort((a, b) => {
      if (a.status === "Abierto" && b.status !== "Abierto") return -1;
      if (a.status !== "Abierto" && b.status === "Abierto") return 1;
      if (a.status === "Cerrado" && b.status !== "Cerrado" && b.status !== "Abierto") return -1;
      if (a.status !== "Cerrado" && b.status === "Cerrado" && a.status !== "Abierto") return 1;
      return 0;
    });

    setGroupedOrders(groupedArray);
  };

  return (
      <div className="border border-gray-300 rounded-md p-2 max-h-[85vh] overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="mb-3 flex flex-wrap gap-3 sm:gap-4 items-end">
          {/* Input de búsqueda */}
          <motion.div
              className="relative flex-grow min-w-[150px]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
          >
            <input
                type="text"
                placeholder="Buscar"
                className="w-full border border-gray-300 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 transition-all duration-300"
                value={searchQuery}
                onChange={handleSearchChange}
            />
            <motion.div
                className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
              <Search className="text-gray-500" size={14} />
            </motion.div>
          </motion.div>

          {/* Filtros */}
          <AnimatePresence mode="sync">
            <motion.div
                className="flex flex-wrap gap-3 sm:gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, staggerChildren: 0.1 }}
            >
              <motion.div
                  className="flex flex-col min-w-[120px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
              >
                <label htmlFor="startDate" className="text-xs font-medium text-gray-700">Desde:</label>
                <input
                    type="date"
                    id="startDate"
                    className="border border-gray-300 rounded-md py-1 text-xs focus:outline-none focus:border-blue-500 transition-all duration-300"
                    value={startDate || ''}
                    onChange={handleStartDateChange}
                />
              </motion.div>

              <motion.div
                  className="flex flex-col min-w-[120px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
              >
                <label htmlFor="endDate" className="text-xs font-medium text-gray-700">Hasta:</label>
                <input
                    type="date"
                    id="endDate"
                    className="border border-gray-300 rounded-md py-1 text-xs focus:outline-none focus:border-blue-500 transition-all duration-300"
                    value={endDate || ''}
                    onChange={handleEndDateChange}
                />
              </motion.div>

              <motion.div
                  className="flex flex-col min-w-[100px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label htmlFor="statusFilter" className="text-xs font-medium text-gray-700">Estado:</label>
                <select
                    id="statusFilter"
                    className="border border-gray-300 rounded-md py-1 text-xs focus:outline-none focus:border-blue-500 transition-all duration-300"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="Abierto">Abierto</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </motion.div>

              <motion.div
                  className="flex flex-col min-w-[100px]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label htmlFor="docTypeFilter" className="text-xs font-medium text-gray-700">Tipo:</label>
                <select
                    id="docTypeFilter"
                    className="border border-gray-300 rounded-md py-1 text-xs focus:outline-none focus:border-blue-500 transition-all duration-300"
                    value={docTypeFilter}
                    onChange={handleDocTypeFilterChange}
                >
                  <option value="">Todos</option>
                  <option value="13">PediClie</option>
                  <option value="83">Cotiza</option>
                </select>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Contenido */}
        <AnimatePresence mode="sync">
          {groupedOrders.length === 0 && !searchQuery && !startDate && !endDate && !statusFilter && !docTypeFilter ? (
              <motion.p
                  className="text-center text-gray-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
              >
                Cargando órdenes...
              </motion.p>
          ) : groupedOrders.length === 0 ? (
              <motion.p
                  className="text-center text-gray-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
              >
                No hay órdenes que coincidan con los filtros...
              </motion.p>
          ) : (
              groupedOrders.map((group) => (
                  <motion.div
                      key={group.status}
                      className="mb-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                  >
                    <h4 className="text-sm font-semibold text-gray-800 mb-1">
                      {group.status === "Abierto" ? "Órdenes Abiertas" : group.status === "Cerrado" ? "Órdenes Cerradas" : `Estado: ${group.status}`}
                    </h4>
                    <div className="space-y-4">
                      {group.orders.map((order, index) => (
                          <motion.div
                              key={order.cardCode + order.docNum}
                              className={`shadow-md rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                                  order.docStatus === "Cerrado" ? "bg-gray-100" : "bg-emerald-50"
                              }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectCardCode(order.docNum)}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-base font-semibold flex items-center gap-2">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                >
                                  <UserCircle size={16} className="text-blue-500" />
                                </motion.div>
                                {order.customerName}
                              </h3>
                              <span className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                            </div>

                            <div className="text-sm flex items-center gap-2 text-gray-600 mb-1">
                              <Hash size={14} />
                              <span>Nro: {order.docNum}</span>
                            </div>

                            <div className="text-sm flex items-center gap-2 text-gray-600 mb-1">
                              <FileText size={14} />
                              <span>Cliente: {order.cardCode}</span>
                            </div>

                            <div className="text-sm flex items-center gap-2 mt-1">
                              {order.docStatus === "Cerrado" ? (
                                  <>
                                    <CheckCircle size={14} className="text-gray-500" />
                                    <span className="text-gray-500">Cerrado</span>
                                  </>
                              ) : (
                                  <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                      <Clock4 size={14} className="text-green-500" />
                                    </motion.div>
                                    <span className="text-green-500">Abierto</span>
                                  </>
                              )}
                            </div>

                            <div className="text-sm flex items-center gap-2 mt-1 flex-wrap">
                              {order.series === 13 && (
                                  <motion.div
                                      className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full w-fit mt-2"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                  >
                                    <FileText size={12} /> Tipo: PediClie
                                  </motion.div>
                              )}
                              {order.series === 83 && (
                                  <motion.div
                                      className="inline-flex items-center gap-1 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full w-fit mt-2"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                  >
                                    <FileText size={12} /> Tipo: Cotiza
                                  </motion.div>
                              )}
                            </div>
                          </motion.div>
                      ))}
                    </div>
                  </motion.div>
              ))
          )}
        </AnimatePresence>

        {/* Modal de detalles */}
        <AnimatePresence mode="sync">
          {isDetailsModalOpen && selectedCardCode && (
              <DetailsModal
                  selectedCardCode={selectedCardCode}
                  isOpen={isDetailsModalOpen}
                  onClose={() => {
                    setIsDetailsModalOpen(false);
                    setShouldRefresh(true);
                  }}
              />
          )}
        </AnimatePresence>
      </div>
  );

};

export default SalesOrderList;
