import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, Plus,
  Search, UserRound, Home, X
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: "Inicio",
      icon: <Home className="w-6 h-6 text-blue-500" />,
      content: "Bienvenido a tu sistema de órdenes de venta. Aquí encontrarás todo lo que necesitas para gestionar tus pedidos.",
      substeps: []
    },
    {
      title: "Crear Órdenes",
      icon: <Plus className="w-6 h-6 text-green-500" />,
      content: "¿Cómo crear una nueva orden de venta?",
      substeps: [],
      detailedSteps: [
        {
          title: "Paso 1: Seleccionar Cliente",
          items: [
            "Haz clic en 'Seleccionar Cliente' para buscar y elegir un cliente",
            "Los datos del cliente se cargarán automáticamente",
            "Puedes ver el margen asignado al cliente"
          ]
        },
        {
          title: "Paso 2: Elegir Tipo de Documento",
          items: [
            "Selecciona si es un pedido o una cotización",
            "Esta opción determina cómo se procesará tu orden"
          ]
        },
        {
          title: "Paso 3: Agregar Productos",
          items: [
            "Usa el botón 'Añadir Artículo' para agregar productos uno por uno",
            "O usa 'Cargar Artículo' para agregar varios productos a la vez",
            "Puedes modificar las cantidades según necesites",
            "Los precios se calculan automáticamente",
            "Los artículos refrigerados se marcan con un ícono de termómetro azul ❄️",
            "Este ícono te ayuda a identificar rápidamente los productos que requieren refrigeración"
          ]
        },
        {
          title: "Paso 4: Agregar Comentarios",
          items: [
            "Añade notas o instrucciones especiales para el pedido",
            "Esta información será visible para todos los involucrados"
          ]
        },
        {
          title: "Paso 5: Finalizar",
          items: [
            "Revisa que toda la información esté correcta",
            "Haz clic en 'Crear Orden de Venta'",
            "El sistema te avisará si falta algo importante",
            "Recibirás una confirmación cuando la orden se cree exitosamente"
          ]
        },
        {
          title: "Consejos Útiles",
          items: [
            "Puedes modificar las cantidades en cualquier momento",
            "Si necesitas eliminar un producto, usa el botón 'x'",
            "El sistema guardará automáticamente los precios correctos",
            "Recibirás avisos si hay algo que necesite tu atención"
          ]
        }
      ]
    },
    {
      title: "Ver y Buscar Órdenes",
      icon: <Search className="w-6 h-6 text-purple-500" />,
      content: "Encuentra fácilmente tus órdenes:",
      substeps: [
        "Ve a 'Listado' en el menú",
        "Usa la barra de búsqueda para encontrar órdenes específicas",
        "Usa el carácter * para búsquedas más flexibles entre palabras",
        "Ejemplo: Clinica * Cartagena encontrará 'Clinica San Jose de Cartagena', 'Clinica Santa Maria de Cartagena', etc.",
        "Filtra por fecha o estado para organizar mejor tu búsqueda",
        "Haz clic en cualquier orden para ver sus detalles"
      ]
    },
    {
      title: "Tu Cuenta",
      icon: <UserRound className="w-6 h-6 text-gray-500" />,
      content: "Gestiona tu información personal:",
      substeps: [
        "Cambia tu contraseña cuando lo necesites",
        "Cierra sesión al terminar tu trabajo",
        "Tu sesión se cerrará automáticamente por seguridad después de un tiempo"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              key="overlay"
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleClose}
            />
            <motion.div 
              key="modal"
              className="fixed inset-0 flex items-center justify-center p-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[75vh] flex flex-col relative"
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={handleModalClick}
              >
                {/* Header más compacto */}
                <div className="p-3 border-b border-gray-200 flex items-center justify-between relative z-10">
                  <div className="flex items-center">
                    <HelpCircle className="w-5 h-5 text-blue-500 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">
                      Guía del Sistema
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100 relative z-20"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content con espaciado reducido */}
                <div className="flex-1 overflow-y-auto p-4">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {steps.map((step, index) => (
                      <motion.div 
                        key={`step-${index}`}
                        className="bg-gray-50 rounded-lg p-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: 5 }}
                      >
                        <div className="flex items-center mb-2">
                          {React.cloneElement(step.icon, { className: 'w-4 h-4 mr-2' })}
                          <h3 className="text-base font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{step.content}</p>

                        {step.substeps.length > 0 && (
                          <motion.ul 
                            className="space-y-1.5 ml-4 mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            {step.substeps.map((substep, subIndex) => (
                              <motion.li 
                                key={`substep-${index}-${subIndex}`}
                                className="flex items-start"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + subIndex * 0.1 }}
                              >
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs mr-2 mt-0.5">
                                  {subIndex + 1}
                                </span>
                                <span className="text-gray-600 text-sm">{substep}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}

                        {step.detailedSteps && (
                          <motion.div 
                            className="mt-3 space-y-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                          >
                            {step.detailedSteps.map((detailedStep, dIndex) => (
                              <motion.div 
                                key={`detailed-${index}-${dIndex}`}
                                className="bg-white p-2.5 rounded-lg shadow-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + dIndex * 0.1 }}
                                whileHover={{ scale: 1.02, x: 5 }}
                              >
                                <h4 className="font-medium text-blue-600 text-sm mb-1.5">
                                  {detailedStep.title}
                                </h4>
                                <ul className="space-y-1">
                                  {detailedStep.items.map((item, iIndex) => (
                                    <motion.li 
                                      key={`item-${index}-${dIndex}-${iIndex}`}
                                      className="flex items-start text-xs"
                                      initial={{ opacity: 0, x: -5 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.9 + iIndex * 0.05 }}
                                    >
                                      <span className="text-blue-500 mr-1.5">•</span>
                                      <span className="text-gray-600">{item}</span>
                                    </motion.li>
                                  ))}
                                </ul>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Footer más compacto */}
                <div className="border-t border-gray-200 p-3 relative z-10">
                  <button
                    onClick={handleClose}
                    className="w-full bg-blue-500 text-white py-1.5 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Entendido
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideModal; 