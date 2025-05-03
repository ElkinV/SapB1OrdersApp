import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialogModal from "../Form/components/ConfirmDialogModal.tsx";

interface LoadItemModalProps {
    isOpen: boolean;
    initialData: string[];
    onClose: () => void;
    onSubmit: (data: string[]) => void;
}

const LoadItemModal: React.FC<LoadItemModalProps> = ({
                                                         isOpen,
                                                         initialData,
                                                         onClose,
                                                         onSubmit,
                                                     }) => {
    const [tableData, setTableData] = useState<string[]>(initialData);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmDialogProps, setConfirmDialogProps] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        confirmButtonClass: 'bg-red-600 hover:bg-red-700'
    });

    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTableData([]);
        }
    }, [isOpen]);

    const handleCellChange = (rowIndex: number, value: string) => {
        const newData = [...tableData];
        newData[rowIndex] = value;
        setTableData(newData);
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const pastedData = event.clipboardData.getData("text");
        const rows = pastedData
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line !== "");

        if (rows.length === 0) {
            toast.warning("No se detectaron datos válidos al pegar.");
            return;
        }

        const updatedData = [...tableData];
        for (let i = 0; i < rows.length; i++) {
            if (i < updatedData.length) {
                updatedData[i] = rows[i];
            } else {
                updatedData.push(rows[i]);
            }
        }

        setTableData(updatedData);
        toast.success(`Se pegaron ${rows.length} filas.`);
    };

    const handleSubmit = () => {
        const filtered = tableData.filter((v) => v.trim() !== "");
        if (filtered.length === 0) {
            toast.error("No puedes guardar una tabla vacía.");
            return;
        }

        onSubmit(filtered);
        onClose();
    };

    const handleCancel = () => {
        if (tableData.length > 0) {
            setConfirmDialogProps({
                title: '¿Descartar datos cargados?',
                message: 'Has ingresado datos en la tabla. ¿Deseas descartarlos y cerrar?',
                onConfirm: () => {
                    setTableData([]);
                    setIsConfirmDialogOpen(false);
                    onClose(); // solo se ejecuta si confirma
                },
                confirmText: 'Sí, descartar',
                cancelText: 'No',
                confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700'
            });
            setIsConfirmDialogOpen(true);
        } else {
            onClose(); // si no hay datos, simplemente cierra
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-[30%] min-w-[300px] flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-semibold text-gray-900">Editar Tabla</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Puedes pegar datos desde Excel o modificar manualmente cada celda.
                        </p>
                    </div>

                    <div
                        className="p-4 flex-1 overflow-auto"
                        onPaste={handlePaste}
                        ref={tableRef}
                    >
                        <div className="rounded-lg border border-gray-200 overflow-hidden text-sm max-h-60">
                            <table className="w-full border-collapse text-sm">
                                <tbody>
                                {tableData.length === 0 ? (
                                    <tr>
                                        <td className="p-4 text-center text-gray-400">
                                            No hay datos. Pega desde Excel o añade manualmente.
                                        </td>
                                    </tr>
                                ) : (
                                    tableData.map((cell, rowIndex) => (
                                        <tr key={rowIndex}>
                                            <td className="border-b border-gray-200 last:border-b-0">
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) =>
                                                        handleCellChange(rowIndex, e.target.value)
                                                    }
                                                    placeholder="Dato..."
                                                    className="w-full px-3 py-2 text-center text-sm focus:outline-none focus:bg-blue-50 transition-colors"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={handleCancel}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={handleSubmit}
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialogModal
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={confirmDialogProps.onConfirm}
                title={confirmDialogProps.title}
                message={confirmDialogProps.message}
                confirmText={confirmDialogProps.confirmText}
                cancelText={confirmDialogProps.cancelText}
                confirmButtonClass={confirmDialogProps.confirmButtonClass}
            />
        </div>
    );
};

export default LoadItemModal;
