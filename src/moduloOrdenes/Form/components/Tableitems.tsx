import React from 'react';
import { Item } from '../../types.ts';
import {ThermometerSnowflake} from "lucide-react";

interface ItemsTableProps {
    items: Item[];
    onItemChange: (index: number, field: string, value: string | number) => void;
    onDeleteItem: (index: number, e: React.MouseEvent<HTMLButtonElement>) => void;
}

const formatNumberWithPoints = (value: number | string): string => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '';
    return number.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const ItemsTable: React.FC<ItemsTableProps> = ({ items, onItemChange, onDeleteItem }) => {
    return (
        <div className="mt-1 border border-gray-300 rounded-lg shadow-sm overflow-hidden flex flex-col text-xs">
            <div className="overflow-y-auto max-h-64">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                        <th className="px-2 py-2 text-left font-semibold text-gray-600 uppercase text-[10px]">Código</th>
                        <th className="px-2 py-2 text-left font-semibold text-gray-600 uppercase text-[10px]">Descripción</th>
                        <th className="px-2 py-2 text-center font-semibold text-gray-600 uppercase text-[10px]">Cantidad</th>
                        <th className="px-2 py-2 text-center font-semibold text-gray-600 uppercase text-[10px]">Precio</th>
                        <th className="px-2 py-2 text-center font-semibold text-gray-600 uppercase text-[10px]">Total</th>
                        <th className="px-2 py-2 text-right font-semibold text-gray-600 uppercase text-[10px]">Acciones</th>
                    </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-2 py-8 text-center text-gray-500 text-sm">No hay artículos
                                añadidos
                            </td>
                        </tr>
                    ) : (
                        items.map((item, index) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-2 py-1.5">{item.itemCode}</td>
                                <td className="px-2 py-1.5 truncate max-w-xs" title={item.name}>
                                    <span className="flex items-center gap-1">
                                        {item.isRefrigerado && <ThermometerSnowflake className="text-blue-500 w-4 h-4"/>}
                                        {item.name}
                                  </span>
                                </td>

                                <td className="px-2 py-1.5 text-center">
                                    <input
                                        type="number"
                                        value={isNaN(item.quantity) ? 0 : item.quantity}
                                        onChange={(e) => onItemChange(index, 'quantity', e.target.value)}
                                        className="w-16 text-center text-xs border rounded py-0.5 px-1 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                    <input
                                        type="number"
                                        value={isNaN(item.unitPrice) ? 0 : item.unitPrice}
                                        onChange={(e) => onItemChange(index, 'unitPrice', e.target.value)}
                                        className="w-20 text-center text-xs border rounded py-0.5 px-1 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                </td>
                                <td className="px-2 py-1.5 text-center font-medium text-gray-700">
                                    ${formatNumberWithPoints(item.quantity * (item.unitPrice || 0))}
                                </td>
                                <td className="px-2 py-1.5 text-right">
                                    <button
                                        type="button"
                                        onClick={(e) => onDeleteItem(index, e)}
                                        className="px-2 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>


                    {items.length > 0 && (
                        <tfoot className="bg-gray-50 border-t border-gray-300 sticky bottom-0 z-10">
                        <tr>
                            <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-700">Total:</td>
                            <td className="px-4 py-3 text-center font-bold text-gray-800">
                                ${formatNumberWithPoints(items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0))}
                            </td>
                            <td></td>
                        </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
};