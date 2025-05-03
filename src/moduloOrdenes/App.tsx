import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './components/Login.tsx';
import {
  Package, List, Plus, ChevronDown,
  UserRound, Home, AlertCircle, Menu, X, HelpCircle, Keyboard
} from 'lucide-react';
import SalesOrderForm from './Form/SalesOrderForm.tsx';
import SalesOrderList from './List/components/SalesOrderList.tsx';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ChangePasswordModal from './components/ChangePasswordModal.tsx';
import {getToken} from "../utils/utils.ts";
import {CONFIG} from "../utils/utils.ts";
import Modal from '../../app/components/Modal.tsx';
import WelcomePage from './components/WelcomePage.tsx';
import GuideModal from './components/GuideModal.tsx';
import SettingsMenu from './components/SettingsMenu.tsx';
import { pageTransition} from '../utils/animations';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { showNotification, NotificationSystem } from './components/NotificationSystem';
import { TableSkeleton } from './components/Skeleton';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import LogoutTransition from './components/LogoutTransition';



function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Verificar token al inicio y periódicamente
  useEffect(() => {
    const savedToken = localStorage.getItem('userToken');
    const savedUsername = localStorage.getItem('username');
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
      setActiveTab('create');
      fetchUserId(savedUsername, savedToken);
    }

    // Verificar el token cada 12 horas
    const tokenCheckInterval = setInterval(() => {
      const currentToken = getToken()
      if (currentToken) {
        verifyToken(currentToken);
      }
    }, 12 * 60 * 1000); // Cada 12 horas

    return () => clearInterval(tokenCheckInterval);
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch(`${CONFIG.apiEndpoint}/api/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenToVerify }),
      });

      if (!response.ok) {
        // Token expirado o inválido
        handleTokenExpiration();
        return false;
      }

      return true;
    } catch (error) {
      toast.error('Error verificando token: '+ error);
      return false;
    }
  };

  const handleTokenExpiration = () => {
    // Mostrar modal de sesión expirada
    setShowSessionExpiredModal(true);
  };

  const handleSessionExpiredConfirm = () => {
    // Limpiar datos y redireccionar a login
    setToken(null);
    setUsername(null);
    setUserId(null);
    setActiveTab('login');
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    setShowSessionExpiredModal(false);
  };

  const fetchUserId = async (username: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CONFIG.apiEndpoint}/api/auth/get-userid?username=${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        // Token expirado
        handleTokenExpiration();
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error al obtener información de usuario: ${response.status}`);
      }

      const userData = await response.json();
      setUserId(userData.USERID);
    } catch (error) {
      setError('No se pudo cargar la información del usuario. Por favor, intente de nuevo:'+ error);
      toast.error('Error al cargar datos de usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Interceptar solicitudes fetch para manejar errores 401 (token expirado)
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const response = await originalFetch.apply(this, args);

      if (response.status === 401 && token) {
        // Si recibimos un 401 y teníamos un token, probablemente expiró
        handleTokenExpiration();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch; // Restaurar fetch original al desmontar
    };
  }, [token]);

  // Implementar atajos de teclado
  useKeyboardShortcuts([
    {
      key: 'n',
      altKey: true,
      handler: () => setActiveTab('create'),
    },
    {
      key: 'l',
      ctrlKey: true,
      handler: () => setActiveTab('view'),
    },
    {
      key: 'h',
      ctrlKey: true,
      handler: () => setActiveTab('home'),
    },
    {
      key: 'g',
      ctrlKey: true,
      handler: () => setIsGuideOpen(true),
    },
  ]);

  const handleLogin = async (token: string, username: string) => {
    setToken(token);
    setUsername(username);
    setActiveTab('home');
    localStorage.setItem('userToken', token);
    localStorage.setItem('username', username);
    await fetchUserId(username, token);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
  };

  const handleLogoutComplete = () => {
    setToken(null);
    setUsername(null);
    setUserId(null);
    setActiveTab('login');
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    setIsLoggingOut(false);
  };

  const getBreadcrumbs = () => {
    const paths = [
      { name: 'Inicio', path: 'home', icon: <Home size={14} className="mr-1" /> },
    ];

    if (activeTab === 'create' || activeTab === 'view') {
      paths.push({ name: 'Órdenes', path: 'orders', icon: <Package size={14} className="mr-1" /> });

      if (activeTab === 'create') {
        paths.push({ name: 'Crear Orden', path: 'create', icon: <Plus size={14} className="mr-1" /> });
      } else if (activeTab === 'view') {
        paths.push({ name: 'Listado', path: 'view', icon: <List size={14} className="mr-1" /> });
      }
    }

    return paths;
  };

  // Mejorar el manejo de errores
  const handleError = (error: string) => {
    setError(error);
    showNotification({
      message: error,
      type: 'error',
      duration: 7000,
    });
  };

  // Mejorar el manejo de éxito
  const handleSuccess = (message: string) => {
    toast.success(message);
    setActiveTab('view');
    setRefreshList(prev => prev + 1);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="w-full max-w-4xl p-4">
            <TableSkeleton />
          </div>
        </div>
    );
  }

  return (
      <>
        {!token ? (
            <Login onLogin={handleLogin} />
        ) : (
            <motion.div
                className="min-h-screen bg-gray-100"
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransition}
            >
              {/* Top Navbar (solo móvil) */}
              <motion.div
                  className="md:hidden flex items-center justify-between bg-white p-4 shadow fixed w-full top-0 z-50"
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.3 }}
              >
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="transition-transform duration-300 hover:scale-110">
                  <Menu size={24} />
                </button>
              </motion.div>

              {/* Layout principal */}
              <div className="flex h-screen">
                {/* Sidebar */}
                <aside
                    className={`bg-white shadow-md w-64 p-4 z-50 rounded-r-xl
                    fixed md:relative top-0 left-0 h-full transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    overflow-y-auto scrollbar-hide`}
                >
                  {/* Botón cerrar (solo móvil) */}
                  <div className="md:hidden flex justify-end mb-4">
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="transition-transform duration-300 hover:scale-110"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Logo */}
                  <motion.div
                      className="flex items-center mb-6"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                  >
                    <img
                        src="https://i.ibb.co/bjdFcGwh/favicon.png"
                        alt="Logo"
                        width="32"
                        height="32"
                        className="mr-2"
                    />
                    <span className="font-bold text-gray-800">RL WebApp</span>

                  </motion.div>

                  {/* Usuario */}
                  <motion.div
                      className="mb-6 font-medium text-gray-700 flex items-center p-3 bg-gray-50 rounded-md"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                  >
                    <UserRound size={18} className="mr-2" />
                    <div className="text-sm">{username || 'Usuario'}</div>
                  </motion.div>

                  {/* Navegación */}
                  <nav className="flex-1">
                    <div className="text-gray-500 text-sm mb-2 font-medium">Módulos</div>
                    <div className="space-y-2">
                      {/* Botón de Inicio/Bienvenida */}
                      <motion.button
                          className={`flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded transition-all duration-300 ${
                              activeTab === 'home' ? 'bg-blue-50 text-blue-700' : ''
                          }`}
                          onClick={() => {
                            setActiveTab('home');
                            if (window.innerWidth < 768) setSidebarOpen(false);
                          }}
                          whileHover={{ x: 5, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <span className="flex items-center">
                          <Home className="w-4 h-4 mr-2" />
                          Inicio
                        </span>
                      </motion.button>

                      {/* Órdenes de Venta Dropdown */}
                      <div>
                        <motion.button
                            className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded justify-between transition-all duration-300"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            whileHover={{ x: 5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            Órdenes de Venta
                          </span>
                          <motion.div
                              animate={{ rotate: dropdownOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                          >
                            <ChevronDown size={15} />
                          </motion.div>
                        </motion.button>

                        <AnimatePresence>
                          {dropdownOpen && (
                              <motion.div
                                  className="pl-6 mt-1 space-y-1 overflow-hidden"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                              >
                                <motion.button
                                    className={`w-full text-left px-4 py-2 rounded flex items-center transition-all duration-300 ${
                                        activeTab === 'create' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => {
                                      setActiveTab('create');
                                      if (window.innerWidth < 768) setSidebarOpen(false);
                                    }}
                                    whileHover={{ x: 5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  <Plus size={15} className="mr-2" />
                                  Crear
                                </motion.button>
                                <motion.button
                                    className={`w-full text-left px-4 py-2 rounded flex items-center transition-all duration-300 ${
                                        activeTab === 'view' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                    onClick={() => {
                                      setActiveTab('view');
                                      if (window.innerWidth < 768) setSidebarOpen(false);
                                    }}
                                    whileHover={{ x: 5, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                  <List size={15} className="mr-2" />
                                  Listado
                                </motion.button>
                              </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </nav>

                  {/* Configuración */}
                  <div className="absolute bottom-1 w-full left-0 px-4">
                    <SettingsMenu
                        username={username}
                        isOpen={settingsOpen}
                        onToggle={() => setSettingsOpen(!settingsOpen)}
                        onClose={() => setSettingsOpen(false)}
                        onLogout={handleLogout}
                        onPasswordChange={() => setIsChangePassOpen(true)}
                    />
                  </div>

                  {/* Guía del Sistema */}
                  <div className="absolute bottom-14 w-full left-0 px-4">
                    <motion.button
                        onClick={() => {
                          setIsGuideOpen(true);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 bg-white"
                        whileHover={{ x: 5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="flex items-center">
                        <HelpCircle size={16} className="mr-2" />
                        Guía del Sistema
                      </span>
                    </motion.button>
                  </div>

                  {/* Atajos de Teclado */}
                  <div className="absolute bottom-28 w-full left-0 px-4 hidden md:block">
                    <motion.button
                        onClick={() => {
                          setIsShortcutsOpen(true);
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-all duration-300 bg-white"
                        whileHover={{ x: 5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="flex items-center">
                        <Keyboard size={16} className="mr-2" />
                        Atajos de Teclado
                      </span>
                    </motion.button>
                  </div>
                </aside>

                {/* Modal Cambiar Clave */}
                {isChangePassOpen && (
                    <ChangePasswordModal
                        username={username}
                        onClose={() => setIsChangePassOpen(false)}
                    />
                )}

                {/* Fondo oscuro para sidebar móvil */}
                {sidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur z-40 md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <motion.main
                    className="flex-1 p-4 md:p-6 min-h-screen bg-gray-100 overflow-y-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                  <nav className="mb-4">
                    <ol className="flex items-center text-sm text-gray-600 mb-3 space-x-2">
                      {getBreadcrumbs().map((item, index) => (
                          <React.Fragment key={item.path}>
                            {index > 0 && (
                                <li className="flex items-center">
                                  <span className="mx-2 text-gray-400">/</span>
                                </li>
                            )}
                            <motion.li
                                className={`flex items-center ${
                                    index === getBreadcrumbs().length - 1
                                        ? 'font-medium text-gray-900'
                                        : 'hover:text-blue-600 transition-colors duration-300'
                                }`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                              <button
                                  className="flex items-center"
                                  onClick={() => {
                                    if (['create', 'view', 'home'].includes(item.path)) {
                                      setActiveTab(item.path);
                                    }
                                  }}
                              >
                                {item.icon}
                                <span>{item.name}</span>
                              </button>
                            </motion.li>
                          </React.Fragment>
                      ))}
                    </ol>
                  </nav>

                  {error && (
                      <motion.div
                          className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 text-red-700 rounded"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                      >
                        <p className="text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto">X</button>
                      </motion.div>
                  )}

                  <motion.div
                      className="bg-white shadow-md rounded-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                  >
                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        {activeTab === 'home' ? (
                            <motion.div
                                key="home"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <WelcomePage
                                  username={username}
                                  onNavigate={(tab) => {
                                    setActiveTab(tab);
                                    showNotification({
                                      message: `Navegando a ${tab}`,
                                      type: 'info',
                                    });
                                  }}
                              />
                            </motion.div>
                        ) : activeTab === 'create' ? (
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <SalesOrderForm
                                  username={username}
                                  onSuccess={(message) => handleSuccess(message)}
                                  onError={(error) => handleError(error)}
                              />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="view"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                              <SalesOrderList
                                  userId={userId}
                                  refresh={refreshList}
                                  onModalClose={() => {
                                    setRefreshList(prev => prev + 1);
                                    showNotification({
                                      message: 'Lista actualizada',
                                      type: 'success',
                                    });
                                  }}
                              />
                            </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.main>
              </div>

              <NotificationSystem />

              {/* Modal de Bienvenida */}
              <Modal
                  isOpen={isWelcomeModalOpen}
                  onClose={() => setIsWelcomeModalOpen(false)}
                  title="Bienvenido al Sistema"
              >
                <div className="text-center">
                  <div className="mb-6">
                    <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Sistema de Gestión de Órdenes de Venta
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Bienvenido {username}, esta plataforma te permite:
                    </p>
                    <ul className="text-left text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center">
                        <Plus className="w-5 h-5 text-green-500 mr-2" />
                        Crear nuevas órdenes de venta
                      </li>
                      <li className="flex items-center">
                        <List className="w-5 h-5 text-blue-500 mr-2" />
                        Visualizar y gestionar órdenes existentes
                      </li>
                      <li className="flex items-center">
                        <Package className="w-5 h-5 text-purple-500 mr-2" />
                        Dar seguimiento a tus pedidos
                      </li>
                    </ul>
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <p className="text-sm text-blue-700">
                        Puedes acceder a todas las funciones desde el menú lateral izquierdo.
                      </p>
                    </div>
                  </div>
                  <button
                      onClick={() => setIsWelcomeModalOpen(false)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
                  >
                    Comenzar
                  </button>
                </div>
              </Modal>

              {/* Modal de Guía del Sistema */}
              <GuideModal
                  isOpen={isGuideOpen}
                  onClose={() => setIsGuideOpen(false)}
              />

              {/* Modal de Atajos de Teclado */}
              <KeyboardShortcutsModal
                  isOpen={isShortcutsOpen}
                  onClose={() => setIsShortcutsOpen(false)}
              />
            </motion.div>
        )}

        {/* Modal de Sesión Expirada */}
        {showSessionExpiredModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-up">
                <div className="mb-4 flex items-center justify-center text-red-500">
                  <AlertCircle size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  Sesión Expirada
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Tu sesión ha expirado por motivos de seguridad. Por favor, inicia sesión nuevamente para continuar.
                </p>
                <div className="flex justify-center">
                  <button
                      type="button"
                      onClick={handleSessionExpiredConfirm}
                      className="py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Transición de cierre de sesión */}
        <LogoutTransition
            isVisible={isLoggingOut}
            onComplete={handleLogoutComplete}
        />
      </>
  );


}

export default App;