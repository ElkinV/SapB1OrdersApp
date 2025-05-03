import React from 'react';
import { Settings, Key, LogOut, User, ChevronUp, ChevronDown } from 'lucide-react';

interface SettingsMenuProps {
  username: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  onPasswordChange: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  username,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  onPasswordChange,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-all duration-300 bg-white"
      >
        <span className="flex items-center">
          <Settings size={16} className="mr-2" />
          Configuración
        </span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10 animate-fade-in-up">
          {/* Header con información del usuario */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500">Usuario Activo</p>
              </div>
            </div>
          </div>

          {/* Opciones de configuración */}
          <div className="py-2">
            <button
              onClick={() => {
                onPasswordChange();
                onClose();
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-300"
            >
              <Key size={16} className="mr-2 text-blue-500" />
              Cambiar Contraseña
            </button>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 my-1" />

          {/* Opción de cerrar sesión */}
          <div className="py-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-all duration-300"
            >
              <LogOut size={16} className="mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu; 