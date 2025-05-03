import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

export const showNotification = ({ message, type = 'info', duration }: NotificationProps) => {
  const options = {
    ...defaultOptions,
    autoClose: duration || defaultOptions.autoClose,
  };

  const toastContent = (
    <div className="flex items-center gap-2">
      {icons[type]}
      <span>{message}</span>
    </div>
  );

  switch (type) {
    case 'success':
      toast.success(toastContent, options);
      break;
    case 'error':
      toast.error(toastContent, options);
      break;
    case 'warning':
      toast.warning(toastContent, options);
      break;
    default:
      toast.info(toastContent, options);
  }
};

export const NotificationSystem: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );
}; 