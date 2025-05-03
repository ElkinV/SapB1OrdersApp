import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ChangePasswordModalProps {
    username: string | null;
    onClose: () => void;
}

const host = "192.168.1.157";

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ username, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (password: string): boolean => {
        // Mínimo 6 caracteres, al menos una letra y un número
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        return passwordRegex.test(password);
    };

    const handleChangePassword = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            // Validaciones del frontend
            if (!oldPassword || !newPassword || !confirmPassword) {
                setErrorMessage('Todos los campos son obligatorios.');
                return;
            }

            if (!validatePassword(newPassword)) {
                setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres, una letra y un número.');
                return;
            }

            if (newPassword !== confirmPassword) {
                setErrorMessage('Las contraseñas nuevas no coinciden.');
                return;
            }

            if (oldPassword === newPassword) {
                setErrorMessage('La nueva contraseña debe ser diferente a la actual.');
                return;
            }

            const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\s*([^;]*).*$)|^.*$/, "$1");
            const response = await fetch(`http://${host}:3001/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username,
                    oldPassword,
                    newPassword,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Manejar errores específicos sin cerrar sesión
                switch (response.status) {
                    case 401:
                        setErrorMessage('La contraseña actual es incorrecta.');
                        break;
                    case 400:
                        setErrorMessage(data.error || 'Error en los datos proporcionados.');
                        break;
                    case 404:
                        setErrorMessage('Usuario no encontrado.');
                        break;
                    case 503:
                        setErrorMessage('Error de conexión con el servidor. Por favor, intente más tarde.');
                        break;
                    case 504:
                        setErrorMessage('El servidor está tardando en responder. Por favor, intente más tarde.');
                        break;
                    default:
                        setErrorMessage('Error al cambiar la contraseña. Por favor, intente nuevamente.');
                }
                toast.error(errorMessage);
                return;
            }

            toast.success("Contraseña actualizada satisfactoriamente");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
        } catch (error) {
            // Manejar errores de red o inesperados
            setErrorMessage('Error de conexión. Por favor, verifique su conexión e intente nuevamente.');
            toast.error('Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100]">
            <AnimatePresence>
                {/* Fondo desenfocado */}
                <motion.div
                    key="overlay"
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={onClose}
                />

                {/* Contenedor del modal */}
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <motion.div 
                            key="modal"
                            className="relative w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl"
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                            <motion.div 
                                className="flex justify-between items-center mb-4"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <h2 className="text-xl font-semibold text-gray-800">Cambiar Contraseña</h2>
                                <motion.button 
                                    onClick={onClose} 
                                    className="text-gray-500 hover:text-gray-700"
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <X size={20} />
                                </motion.button>
                            </motion.div>

                            <AnimatePresence>
                                {errorMessage && (
                                    <motion.div 
                                        key="error-message"
                                        className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    >
                                        <AlertCircle size={16} className="inline mr-1" />
                                        {errorMessage}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.form 
                                onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <motion.div 
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <label htmlFor="old-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña Actual:
                                    </label>
                                    <motion.input
                                        type="password"
                                        id="old-password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        whileFocus={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    />
                                </motion.div>

                                <motion.div 
                                    className="mb-4"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nueva Contraseña:
                                    </label>
                                    <motion.input
                                        type="password"
                                        id="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        required
                                        minLength={6}
                                        whileFocus={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres recomendado</p>
                                </motion.div>

                                <motion.div 
                                    className="mb-5"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirmar Contraseña:
                                    </label>
                                    <motion.input
                                        type="password"
                                        id="confirm-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full border p-2 rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                                            confirmPassword && newPassword !== confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                        required
                                        whileFocus={{ scale: 1.02 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    />
                                    <AnimatePresence>
                                        {confirmPassword && newPassword !== confirmPassword && (
                                            <motion.p 
                                                className="text-xs text-red-600 mt-1"
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            >
                                                Las contraseñas no coinciden
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                <motion.div 
                                    className="flex justify-end space-x-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <motion.button
                                        type="button"
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                                        onClick={onClose}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-not-allowed"
                                        disabled={isLoading || !oldPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                                        whileHover={{ scale: isLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Procesando...
                                            </div>
                                        ) : (
                                            'Confirmar Cambio'
                                        )}
                                    </motion.button>
                                </motion.div>
                            </motion.form>
                        </motion.div>
                    </div>
                </div>
            </AnimatePresence>
        </div>
    );
};

export default ChangePasswordModal;
