import React, { useState } from 'react';
import Modal from '../components/Modal';
import { Package, List, Plus } from 'lucide-react';

const Home = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        Bienvenido al Sistema de Órdenes de Venta
                    </h1>
                    <p className="text-gray-600">
                        Gestiona tus órdenes de venta de manera eficiente y sencilla
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Package className="w-8 h-8 text-blue-500 mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Órdenes de Venta</h3>
                        <p className="text-gray-600 text-sm">Gestiona todas tus órdenes en un solo lugar</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <List className="w-8 h-8 text-green-500 mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Listado</h3>
                        <p className="text-gray-600 text-sm">Visualiza y administra órdenes existentes</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Plus className="w-8 h-8 text-purple-500 mb-3" />
                        <h3 className="font-semibold text-lg mb-2">Nueva Orden</h3>
                        <p className="text-gray-600 text-sm">Crea una nueva orden de venta</p>
                    </div>
                </div>

                {/* Welcome Button */}
                <div className="text-center">
                    <button
                        onClick={openModal}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                    >
                        Más Información
                    </button>
                </div>

                {/* Welcome Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title="Bienvenido al Sistema"
                >
                    <div className="text-center">
                        <div className="mb-6">
                            <Package className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Sistema de Gestión de Órdenes de Venta
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Esta plataforma te permite:
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
                        </div>
                        <button
                            onClick={closeModal}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
                        >
                            Entendido
                        </button>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default Home;