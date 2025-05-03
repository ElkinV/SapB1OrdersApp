import React, { useState, useEffect } from "react";
import {X, PlusCircle, Trash2, Loader2, ThermometerSnowflake} from "lucide-react";
import { DocumentLineItems, OrderDetails } from "../../types.ts";
import ItemSelectionModal from "../../Form/components/ItemSelectionModal.tsx";
import { toast } from 'react-toastify';
import { CONFIG, getToken } from "../../../utils/utils.ts";

// Componente simple de confirmación
const ConfirmDialog = ({ isOpen, onConfirm, onCancel, isLastItem }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void; isLastItem: boolean }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center space-y-4"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-800">¿Estás seguro?</h3>
                <p className="text-sm text-gray-600">
                    {isLastItem
                        ? "No puedes eliminar el último artículo de la orden. La orden debe tener al menos un artículo."
                        : "Esta acción eliminará el artículo. ¿Deseas continuar?"}
                </p>
                <div className="flex justify-center gap-4 mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCancel();
                        }}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    {!isLastItem && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onConfirm();
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                            Eliminar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

interface EditOrderProps {
    isOpen: boolean;
    onClose: () => void;
    docEntry: number;
    details: OrderDetails[];
}

export const EditOrderModal: React.FC<EditOrderProps> = ({ isOpen, onClose, docEntry, details }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<DocumentLineItems[]>([]);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [listNum, setListNum] = useState<number | 0>(-9);
    const [hasChanges, setHasChanges] = useState(false);

    // Confirmación
    const [showConfirm, setShowConfirm] = useState(false);
    const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: { key: string; }) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            const mappedDetails: DocumentLineItems[] = details.map((detail, index) => ({
                LineNum: index,
                ItemCode: detail.itemCode,
                Quantity: detail.quantity,
                Price: detail.price,
                Currency: "$",
                CostingCode: "1",
                COGSCostingCode2: "1.8",
                Description: detail.description || "",
                IsRefrigerado: detail.isRefrigerado,
            }));
            setItems(mappedDetails);
            setListNum(details[0]?.listNum ?? 1);
            setHasChanges(false);
        }

        const fetchDetails = async () => {
            if (!isOpen || !docEntry) return;

            setLoading(true);
            setError(null);

            try {
                const token = getToken();
                const response = await fetch(
                    `http://${CONFIG.host}:3001/api/orders/itemByOrder?docEntry=${docEntry}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                if (!response.ok) {
                    toast.error(`Error al obtener detalles de la Orden`);
                }

                const data: DocumentLineItems[] = await response.json();
                // Asegurarse de que cada item tenga una descripción
                const itemsWithDescription = data.map(item => ({
                    ...item,
                    Description: item.Description || details.find(d => d.itemCode === item.ItemCode)?.description || ""
                }));
                setItems(itemsWithDescription);
            } catch (err) {
                setError(`Failed to fetch details: ${err instanceof Error ? err.message : "Unknown error"}`);
            } finally {
                setLoading(false);
            }
        };

        (async () => {
            await fetchDetails();
        })();
    }, [isOpen, docEntry, details]);

    const handleInputChange = (index: number, field: string, value: number) => {
        setItems((prevItems) => {
            const updatedItems = [...prevItems];
            updatedItems[index] = {
                ...updatedItems[index],
                [field]: value,
            };
            return updatedItems;
        });
        setHasChanges(true);
    };

    const confirmDelete = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // Verificar si es el último item
        if (items.length <= 1) {
            setItemToDeleteIndex(index);
            setShowConfirm(true);
            return;
        }
        setItemToDeleteIndex(index);
        setShowConfirm(true);
    };

    const deleteItem = () => {
        if (itemToDeleteIndex !== null) {
            const updatedItems = items.filter((_, i) => i !== itemToDeleteIndex);
            setItems(updatedItems);
            setHasChanges(true);
        }
        setShowConfirm(false);
        setItemToDeleteIndex(null);
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleClose = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
    };

    const handleAddItem = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsItemModalOpen(true);
    };

    const handleSelectItem = (item: any) => {
        setItems((prevItems) => {
            const newItems = [...prevItems, item];
            setHasChanges(true);
            return newItems;
        });
    };

    const updateSalesOrder = async (data: DocumentLineItems[], docEntry: number) => {
        try {
            const token = getToken();
            const body = {
                items: data,
                docEntry: docEntry,
            };
            const response = await fetch(`http://${CONFIG.host}:3001/api/orders/edit`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                toast.error("Hubo un problema al actualizar la order, intente nuevamente");
            }
        } catch (err) {
            setError("Error al actualizar Orden: " + err);
        }
    };

    const handleUpdate = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Validar que haya al menos un item
        if (items.length === 0) {
            toast.error("La orden debe tener al menos un artículo ❌");
            return;
        }

        // Validar si hay cambios
        if (!hasChanges) {
            toast.info("No hay cambios para actualizar ℹ️");
            return;
        }

        try {
            await updateSalesOrder(items, docEntry);
            toast.success("Orden actualizada correctamente ✅");
            onClose();
        } catch (error) {
            toast.error("Error al actualizar la orden ❌");
        }
    };

    return (
        isOpen && (
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={handleModalClick}
            >
                <div
                    className="bg-white rounded-xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden sm:w-full sm:max-w-[90%] lg:max-w-4xl"
                    onClick={handleModalClick}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-5 border-b">
                        <h2 className="text-2xl font-semibold text-gray-900">Editar Orden</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Cerrar"
                        >
                            <X size={24} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Add Item */}
                    <div className="p-4">
                        <button
                            onClick={handleAddItem}
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <PlusCircle size={18} />
                            Añadir 1 Artículo
                        </button>
                    </div>

                    {/* Error */}
                    {error && <p className="text-red-500 text-center px-4">{error}</p>}

                    {/* Table */}
                    <div className="overflow-auto flex-1 px-4 pb-4">
                        {loading ? (
                            <div className="flex justify-center items-center h-40 text-gray-700">
                                <Loader2 size={24} className="animate-spin mr-2" />
                                Cargando...
                            </div>
                        ) : items.length > 0 ? (
                            <table className="w-full text-sm border-collapse">
                                <thead className="sticky top-0 bg-gray-100 text-gray-800 border-b">
                                <tr>
                                    {["#", "Código", "Descripcion","Cantidad", "Precio Unitario", "Total", "Acciones"].map((header) => (
                                        <th key={header} className="px-4 py-2 text-left font-medium">{header}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{index + 1}</td>
                                        <td className="px-4 py-2">{item.ItemCode}</td>
                                        <td className ="px-4 py-2">{item.IsRefrigerado && <ThermometerSnowflake size ={18}className="inline ml-1 text-blue-500" />}{item.Description}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={items[index]?.Quantity ?? item.Quantity}
                                                onChange={(e) => handleInputChange(index, "Quantity", Number(e.target.value))}
                                                className="w-20 px-2 py-1 border rounded text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={items[index]?.Price ?? item.Price}
                                                onChange={(e) => handleInputChange(index, "Price", Number(e.target.value))}
                                                className="w-28 px-2 py-1 border rounded text-center"
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            ${((items[index]?.Quantity ?? item.Quantity) * (items[index]?.Price ?? item.Price)).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2">
                                            <button
                                                type="button"
                                                onClick={(e) => confirmDelete(index, e)}
                                                className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                            >
                                                <Trash2 size={16} />
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-gray-700">No hay artículos en esta orden.</p>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t flex justify-center">
                        <button
                            onClick={handleUpdate}
                            className={`px-6 py-2 rounded-lg transition-colors ${
                                hasChanges
                                    ? "bg-green-500 text-white hover:bg-green-600"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!hasChanges}
                        >
                            Actualizar
                        </button>
                    </div>
                </div>

                <ItemSelectionModal
                    isOpen={isItemModalOpen}
                    onClose={() => setIsItemModalOpen(false)}
                    onSelectItem={handleSelectItem}
                />

                <ConfirmDialog
                    isOpen={showConfirm}
                    onConfirm={deleteItem}
                    onCancel={() => setShowConfirm(false)}
                    isLastItem={items.length <= 1}
                />
            </div>
        )
    );
};
