import React, { useState } from 'react';
import {Customer, SalesOrder, Item} from '../types.ts';
import { Plus } from 'lucide-react';
import CustomerSelectionModal from './components/CustomerSelectionModal.tsx';
import DropdownMenu from './components/dropdownMenu.tsx';
import { toast} from 'react-toastify';
import Loader from "../components/Loader.tsx"
import ItemSelectionModal from "./components/ItemSelectionModal.tsx";
import LoadItemModal from "../components/loadItemsModal.tsx";
import {CONFIG, getToken} from "../../utils/utils.ts";
import {ItemsTable} from "./components/Tableitems.tsx";
import ConfirmDialogModal from "./components/ConfirmDialogModal.tsx";
import { AnimatePresence } from 'framer-motion';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface SalesOrderFormProps {
  username: string | null;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

const SalesOrderForm: React.FC<SalesOrderFormProps> = ({ username, onSuccess, onError }) => {
  const [customerName, setCustomerName] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [margen, setMargen] = useState('');
  const [priceList, setPriceList] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState('');
  const [selectedMenuOption, setSelectedMenuOption] = useState<number | null>(null);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [tableData, setTableData] = useState<string[]>(Array(3).fill(""));

  // Estados para el ConfirmDialog
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogProps, setConfirmDialogProps] = useState({
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700'
  });

  const handleOptionSelect = (option: number) => {
    setSelectedMenuOption(option); // Actualiza la opción seleccionada
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si no hay cliente o no hay artículos, mostrar un mensaje de confirmación
    if (!cardCode || items.length === 0) {
      setConfirmDialogProps({
        title: 'Confirmar envío',
        message: !cardCode
            ? 'No has seleccionado un cliente. ¿Estás seguro de continuar?'
            : 'No has agregado artículos. ¿Estás seguro de continuar?',
        onConfirm: () => processSubmit(),
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700'
      });
      setIsConfirmDialogOpen(true);
    } else {
      processSubmit();
    }
  };

  const processSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    let userId: string | 'Usuario'= 'Usuario';
    try {
      const token = getToken()
      const userResponse = await fetch(`http://${CONFIG.host}:3001/api/auth/get-userid?username=${username}`,{
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!userResponse.ok) {
        const errorMessage = 'No se pudo obtener el ID de Usuario';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsSubmitting(false);
        return;
      }
      const userData = await userResponse.json();
      userId = userData.USERID;
    } catch (err) {
      if( typeof err === "object" && err && "message" in err && typeof err.message === "string"){
        setError(err.message);
        onError?.(err.message);
        setIsSubmitting(false);
        return;
      }
    }

    const newOrder: SalesOrder = {
      customerName: customerName,
      cardCode: cardCode,
      date: new Date().toISOString(),
      items: items,
      total: items.reduce((sum, item) => sum + item.quantity * (item.unitPrice || 0), 0),
      comments: comments,
      user: userId,
      series:selectedMenuOption ?? 0,
      docNum:0,
      docStatus:""
    };

    try {
      const token = getToken()
      const response = await fetch(`http://${CONFIG.host}:3001/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newOrder),
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        const errorMessage = errorDetails.error?.message?.value || 'Error al crear la orden';
        setError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      const successMessage = 'Orden de venta creada correctamente';
      onSuccess?.(successMessage);

      // Limpiar el formulario y redirigir
      setCustomerName('');
      setMargen('');
      setCardCode('');
      setItems([]);
      setComments('');
      setSelectedMenuOption(null);

    

    } catch (err) {
      if( typeof err === "object" && err && "message" in err && typeof err.message === "string"){
        const errorMessage = 'Error Creando Orden, intente nuevamente: '+ err;
        setError(err.message);
        onError?.(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: Math.max(0, parseInt(value.toString())) };
    } else if (field === 'unitPrice') {
      newItems[index] = { ...newItems[index], [field]: Math.max(0, parseFloat(value.toString()) || 0) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = async()=> {
    setLoading(true);
    setCurrentEditIndex(items.length);
    setIsModalOpen(true);
    setLoading(false);
  };

  const loadItems = async () => {
    setIsLoadModalOpen(true);
  }

  const handleSelectItem = async (selectedItem: Item) => {
    if (priceList !== null) {
      try {
        const token = getToken();
        const response = await fetch(`http://${CONFIG.host}:3001/api/items/price?itemCode=${selectedItem.itemCode}&priceList=${priceList}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          toast.error('No se pudo obtener el precio del artículo.');
          return;
        }
        const priceData = await response.json();
        const margenDecimal = Number(margen) || 0;
        const updatedItem = {
          name: selectedItem.name,
          itemCode: selectedItem.itemCode,
          quantity: selectedItem.quantity || 1,
          unitPrice: priceData.price,
          U_RL_Margen: margenDecimal,
          isRefrigerado: selectedItem.isRefrigerado,
          WarehouseCode: selectedItem.WarehouseCode
        };

        setItems((prevItems) => {
          if (currentEditIndex !== null) {
            const newItems = [...prevItems];
            newItems[currentEditIndex] = updatedItem;
            return newItems;
          }
          return [...prevItems, updatedItem];
        });
        setCurrentEditIndex(null);
      } catch (error) {
        toast.error('Error al obtener el precio del artículo.');
      }
    }
  };

  const handleChargeItems=async (item: string)=>{
    if (priceList !== null) {
      try {
        await delay(1000);
        const token = getToken();
        const priceResponse = await fetch(`http://${CONFIG.host}:3001/api/items/price?itemCode=${item}&priceList=${priceList}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const itemResponse = await fetch(`http://${CONFIG.host}:3001/api/items/?search=${encodeURIComponent(item)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // Validar ambas respuestas
        if (!priceResponse.ok) {
          toast.error(`Error al obtener el precio del artículo: ${priceResponse.statusText}`);
          return;
        }
        if (!itemResponse.ok) {
          toast.error(`Error al obtener los datos del artículo: ${itemResponse.statusText}`);
          return;
        }

        // Parsear los datos de las respuestas
        const priceData = await priceResponse.json();
        const itemData = await itemResponse.json();

        // Validar los datos obtenidos
        if (!priceData || typeof priceData.price !== "number") {
          toast.error("Los datos del precio no son válidos.");
        }
        if (!itemData || !itemData[0] || typeof itemData[0].name !== "string") {
          toast.error("Los datos del artículo no son válidos.");
        }

        // Crear el objeto actualizado
        const updatedItem = {
          name: itemData[0].name,
          itemCode: item,
          quantity: 1,
          unitPrice: priceData.price,
          isRefrigerado: itemData.isRefrigerado,
        };

        // Actualizar la lista de ítems
        setItems((prevItems) => {
          if (currentEditIndex !== null) {
            const newItems = [...prevItems];
            newItems[currentEditIndex] = updatedItem;
            return newItems;
          }
          return [...prevItems, updatedItem];
        });

        // Restablecer el índice de edición actual
        setCurrentEditIndex(null);
      } catch (error) {
        toast.error("Error al obtener los datos del artículo o su precio.");
      }
    }
  }

  const handleSelectCustomer = async (selectedCustomer: Customer) => {
    // Si ya hay un cliente seleccionado y hay artículos, mostrar confirmación
    if (cardCode && items.length > 0) {
      setConfirmDialogProps({
        title: 'Cambiar cliente',
        message: 'Cambiar el cliente podría modificar los precios de los artículos ya agregados. ¿Deseas continuar?',
        onConfirm: () => updateCustomer(selectedCustomer),
        confirmText: 'Continuar',
        cancelText: 'Cancelar',
        confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700'
      });
      setIsConfirmDialogOpen(true);
    } else {
      updateCustomer(selectedCustomer);
    }
  };

  const updateCustomer = async (selectedCustomer: Customer) => {
    setCardCode(selectedCustomer.id);
    setCustomerName(selectedCustomer.name);
    setPriceList(selectedCustomer.priceList);
    setMargen(selectedCustomer.margen);

    // Si la lista de precios no es válida, salimos
    if (selectedCustomer.priceList === null) return;

    try {
      // Extraemos el token una vez
      const token = getToken();

      // Actualizamos los precios de los items
      const updatedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const response = await fetch(
                  `http://${CONFIG.host}:3001/api/items/price?itemCode=${item.itemCode}&priceList=${selectedCustomer.priceList}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
              );

              if (!response.ok) {
                toast.error(`Error al traer el precio del item ${item.itemCode}: ${response.statusText}`);
                return item; // Retornamos el item sin cambios en caso de error
              }

              const priceData = await response.json();
              return {
                ...item,
                unitPrice: priceData.price,
              };
            } catch (error) {
              setError(`Error al traer el precio del item ${item.itemCode}: `+ error);
              return item; // Retornamos el item sin cambios en caso de error
            }
          })
      );

      // Actualizamos el estado con los nuevos precios
      setItems(updatedItems);
    } catch (error) {
      toast.error("Hubo un error al actualizar los precios, verifique los items: "+  error);
    }
  };

  const handleDeleteItem = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevenir la acción predeterminada (enviar formulario)

    // Mostrar confirmación antes de eliminar
    setConfirmDialogProps({
      title: 'Eliminar artículo',
      message: '¿Estás seguro de que deseas eliminar este artículo?',
      onConfirm: () => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
      },
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700'
    });
    setIsConfirmDialogOpen(true);
  };

  const handleloadsItems = async (data: string[]) => {
    setTableData(data); // Actualiza los datos en el padre

    for (let i = 0; i < data.length; i++) {
      await handleChargeItems(data[i]);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl bg-white p-4 mx-auto">

        {/* Sección Cliente */}
        <h3 className="text-md font-medium text-gray-700">Información del Cliente</h3>
        <div className="bg-gray-10 p-4 rounded-lg border border-gray-200 mt-1">
          <div className="flex flex-wrap gap-4">

            <div className="w-full sm:w-[calc(50%-0.5rem)] md:flex-1 min-w-[200px]">
              <label htmlFor="cardCode" className="block text-sm font-medium text-gray-700 mb-1">
                Código del Cliente
              </label>
              <input
                  type="text"
                  id="cardCode"
                  value={cardCode}
                  className="block w-full rounded-md bg-blue-50 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  readOnly
                  required
              />
            </div>

            <div className="w-full sm:w-[calc(50%-0.5rem)] md:flex-1 min-w-[200px]">
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Cliente
              </label>
              <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  className="block w-full rounded-md bg-blue-50 border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  readOnly
                  required
              />
            </div>

            <div className="w-[120px]">
              <label htmlFor="margen" className="block text-sm font-medium text-gray-700 mb-1">
                Margen
              </label>
              <input
                  type="text"
                  id="margen"
                  value={margen}
                  className="block w-full rounded-md bg-blue-50 border-gray-300 shadow-sm text-center focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  readOnly
                  required
              />
            </div>

            <div className="w-full sm:w-auto flex items-end">
              <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="mb-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-xs w-full sm:w-auto"
              >
                Seleccionar Cliente
              </button>
            </div>

            <div className="w-full sm:w-auto flex items-end">
              <DropdownMenu onOptionSelect={handleOptionSelect} />
            </div>
          </div>
        </div>

        {loading && (
            <div className="flex justify-center p-2">
              <Loader />
            </div>
        )}

        {/* Sección Artículos */}
        <div className="mt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
            <h3 className="text-md font-medium text-gray-700">Artículos</h3>
            <div className="flex flex-wrap gap-2">
              <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center transition text-xs"
              >
                <Plus size={18} className="mr-2" />
                Añadir Artículo
              </button>

              <button
                  type="button"
                  onClick={loadItems}
                  className="px-4 py-2 bg-orange-100 text-gray-700 rounded-md hover:bg-orange-300 flex items-center transition text-xs"
              >
                <Plus size={18} className="mr-2" />
                Cargar Artículo
              </button>
            </div>
          </div>

          <ItemsTable
              items={items}
              onItemChange={handleItemChange}
              onDeleteItem={handleDeleteItem}
          />
        </div>

        {error && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
        )}

        {/* Comentarios */}
        <div className="mt-4">
          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
            Comentarios
          </label>
          <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Añada comentarios adicionales aquí..."
              rows={3}
              className="block w-full bg-gray-50 rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>

        {/* Botón Submit */}
        <div className="pt-4 border-t border-gray-200">
          <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition font-medium"
              disabled={isSubmitting}
          >
            {isSubmitting ? 'Creando Orden...' : 'Crear Orden de Venta'}
          </button>
        </div>
      </form>

      {/* Modales */}
      <AnimatePresence mode="sync">
        {isModalOpen && (
          <ItemSelectionModal
            key="item-selection"
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelectItem={handleSelectItem}
          />
        )}

        {isCustomerModalOpen && (
          <CustomerSelectionModal
            key="customer-selection"
            isOpen={isCustomerModalOpen}
            onClose={() => setIsCustomerModalOpen(false)}
            onSelectCustomer={handleSelectCustomer}
          />
        )}

        {isLoadModalOpen && (
          <LoadItemModal
            key="load-items"
            isOpen={isLoadModalOpen}
            onClose={() => setIsLoadModalOpen(false)}
            initialData={tableData}
            onSubmit={handleloadsItems}
          />
        )}

        {isConfirmDialogOpen && (
          <ConfirmDialogModal
            key="confirm-dialog"
            isOpen={isConfirmDialogOpen}
            onClose={() => setIsConfirmDialogOpen(false)}
            onConfirm={confirmDialogProps.onConfirm}
            title={confirmDialogProps.title}
            message={confirmDialogProps.message}
            confirmText={confirmDialogProps.confirmText}
            cancelText={confirmDialogProps.cancelText}
            confirmButtonClass={confirmDialogProps.confirmButtonClass}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SalesOrderForm;