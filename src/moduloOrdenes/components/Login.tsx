import { useState } from 'react';
import { ArrowRight, User, Lock, X, Mail } from 'lucide-react';
import {CONFIG} from "../../utils/utils.ts";
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onLogin: (token: string, username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [touched, setTouched] = useState({ user: false, pass: false });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const response = await fetch(`http://${CONFIG.host}:3001/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Set token in cookie with proper attributes
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 7); // 7 days expiration
      document.cookie = `token=${data.token}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      onLogin(data.token, username);
    } catch (error) {
      console.error('Error during login:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoggingIn) {
      handleLogin(e);
    }
  };

  return (
      <div
          className="w-screen h-screen bg-gray-100 bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: 'url(/background.jpg)' }}
          aria-label="Pantalla de inicio de sesión"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/40 to-white/60 backdrop-blur-sm" />

        <AnimatePresence mode="sync">
          <motion.div
              className={`backdrop-blur-xl bg-white/70 border border-white/30 shadow-2xl text-gray-800 p-8 rounded-3xl w-[360px] transition-all duration-700 ${
                  isLoggingIn ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'
              }`}
              role="form"
              aria-labelledby="login-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
          >
            <h2
                id="login-title"
                className="text-blue-600 font-semibold text-center text-xl mb-6"
            >
              RL WebAPP
            </h2>

            <div className="mb-4">
              <label htmlFor="username" className="block mb-1 text-sm text-gray-600">
                Usuario
              </label>
              <div className="flex items-center border-b border-blue-400 mb-1">
                <User className="text-blue-500 mr-2" />
                <input
                    id="username"
                    type="text"
                    placeholder="Escribe tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, user: true }))}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none py-1"
                    aria-invalid={!!error}
                    aria-describedby="userError"
                />
              </div>
              {touched.user && username.trim() === '' && (
                  <p id="userError" className="text-red-500 text-sm mt-1">
                    El usuario es obligatorio.
                  </p>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-1 text-sm text-gray-600">
                Contraseña
              </label>
              <div className="flex items-center border-b border-blue-400 mb-1">
                <Lock className="text-blue-500 mr-2" />
                <input
                    id="password"
                    type="password"
                    placeholder="Escribe tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, pass: true }))}
                    onKeyPress={handleKeyPress}
                    className="w-full bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none py-1"
                    aria-invalid={!!error}
                    aria-describedby="passError"
                />
              </div>
              {touched.pass && password.trim() === '' && (
                  <p id="passError" className="text-red-500 text-sm mt-1">
                    La contraseña es obligatoria.
                  </p>
              )}
            </div>

            {error && (
                <p className="text-red-600 text-sm mb-4">
                  {error}
                </p>
            )}

            <div className="flex justify-between items-center mb-4">
              <button
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                ¿Olvidaste tu Clave?
              </button>
              <button
                  onClick={handleLogin}
                  className="bg-blue-500 hover:bg-blue-600 rounded-full p-3 transition duration-300"
                  aria-label="Iniciar sesión"
                  disabled={isLoggingIn}
              >
                <ArrowRight className="text-white" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Modal de Olvidaste tu Clave */}
        <AnimatePresence mode="sync">
          {showForgotPasswordModal && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">¿Olvidaste tu Clave?</h3>
                  <motion.button
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">
                    Por favor, contacta al equipo de Sistemas para recuperar tu contraseña:
                  </p>
                  
                  <div className="space-y-2">
                    <a 
                      href="mailto:sistemas@rlpharma.com.co"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      sistemas@rlpharma.com.co
                    </a>
                    <a 
                      href="mailto:auxsistemas@rlpharma.com.co"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      auxsistemas@rlpharma.com.co
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
  );
}
