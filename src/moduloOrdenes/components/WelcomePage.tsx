import React from 'react';
import { Package, List, Plus, Home, Settings, HelpCircle, ArrowRight } from 'lucide-react';

interface WelcomePageProps {
  username: string | null;
  onNavigate?: (tab: string) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ username, onNavigate }) => {
  return (
    <div className="h-[calc(100vh-13rem)] md:h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Package className="w-16 h-16 text-blue-500" />
              <div className="text-left">
                <h2 className="text-3xl font-bold text-gray-800">
                  Sistema de Gestión de Órdenes
                </h2>
                <p className="text-xl text-gray-600 mt-2">
                  Bienvenido, {username}
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions Section */}
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => onNavigate?.('create')}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-blue-50 w-full text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <Plus className="w-12 h-12 text-green-500" />
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-800">Crear Órdenes</h3>
              <p className="text-gray-600">
                Crea nuevas órdenes de venta de manera rápida y eficiente. Selecciona clientes, añade productos y gestiona tus ventas.
              </p>
            </button>
            
            <button
              onClick={() => onNavigate?.('view')}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-blue-50 w-full text-left group"
            >
              <div className="flex items-center justify-between mb-4">
                <List className="w-12 h-12 text-blue-500" />
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-gray-800">Gestionar Órdenes</h3>
              <p className="text-gray-600">
                Visualiza y administra todas tus órdenes existentes. Filtra, busca y actualiza el estado de tus ventas.
              </p>
            </button>
          </div>

          {/* Navigation Guide Section */}
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="font-semibold text-xl text-blue-800 mb-6 flex items-center">
              <Home className="w-6 h-6 mr-3" />
              Guía de Navegación
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Home className="w-8 h-8 text-blue-500 mb-4" />
                <h4 className="font-medium text-gray-800 mb-2">Inicio</h4>
                <p className="text-gray-600 text-sm">
                  Vuelve a esta página cuando necesites acceder rápidamente a las funciones principales.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Package className="w-8 h-8 text-blue-500 mb-4" />
                <h4 className="font-medium text-gray-800 mb-2">Órdenes</h4>
                <p className="text-gray-600 text-sm">
                  Gestiona todas tus órdenes de venta, desde la creación hasta el seguimiento.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Settings className="w-8 h-8 text-blue-500 mb-4" />
                <h4 className="font-medium text-gray-800 mb-2">Configuración</h4>
                <p className="text-gray-600 text-sm">
                  Ajusta tus preferencias y configuración personal del sistema.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <HelpCircle className="w-8 h-8 text-blue-500 mr-3" />
              <h3 className="font-semibold text-xl text-gray-800">
                Preguntas Frecuentes
              </h3>
            </div>
            <div className="grid gap-4">
              <details className="bg-gray-50 p-6 rounded-lg">
                <summary className="font-medium text-blue-600 cursor-pointer hover:text-blue-700 transition-colors flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  ¿Cómo creo una nueva orden de venta?
                </summary>
                <p className="mt-4 text-gray-600 pl-7">
                  Para crear una nueva orden, haz clic en "Crear" en el menú de Órdenes de Venta. 
                  Completa el formulario con los datos requeridos y guarda los cambios.
                </p>
              </details>

              <details className="bg-gray-50 p-6 rounded-lg">
                <summary className="font-medium text-blue-600 cursor-pointer hover:text-blue-700 transition-colors flex items-center">
                  <List className="w-5 h-5 mr-2" />
                  ¿Cómo puedo ver mis órdenes existentes?
                </summary>
                <p className="mt-4 text-gray-600 pl-7">
                  Accede a "Listado" en el menú de Órdenes de Venta para ver todas tus órdenes. 
                  Puedes filtrar y buscar órdenes específicas.
                </p>
              </details>

              <details className="bg-gray-50 p-6 rounded-lg">
                <summary className="font-medium text-blue-600 cursor-pointer hover:text-blue-700 transition-colors flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  ¿Cómo cambio mi contraseña?
                </summary>
                <p className="mt-4 text-gray-600 pl-7">
                  Ve a "Configuración" en la parte inferior del menú lateral y selecciona "Cambiar Clave". 
                  Sigue las instrucciones para actualizar tu contraseña.
                </p>
              </details>

              <details className="bg-gray-50 p-6 rounded-lg">
                <summary className="font-medium text-blue-600 cursor-pointer hover:text-blue-700 transition-colors flex items-center">
                  <HelpCircle className="w-5 h-5 mr-2" />
                  ¿Qué hago si mi sesión expira?
                </summary>
                <p className="mt-4 text-gray-600 pl-7">
                  Si tu sesión expira, el sistema te mostrará un mensaje. 
                  Simplemente inicia sesión nuevamente para continuar trabajando.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 