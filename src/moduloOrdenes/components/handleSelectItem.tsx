import { toast } from "react-toastify";
import { DocumentLineItems, Item } from "../types.ts";
import React from "react";
import {CONFIG, getToken} from "../../utils/utils.ts";



export const handleSelectItem = async (
    selectedItem: Item,
    setItems: React.Dispatch<React.SetStateAction<DocumentLineItems[]>>,
    priceList: number,
) => {
    try {
        const token = getToken();
        const response = await fetch(
            `http://${CONFIG.host}:3001/api/items/price?itemCode=${selectedItem.itemCode}&priceList=${priceList}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!response.ok) {
            toast.error("Error al obtener el precio");
        }

        const priceData = await response.json();

        setItems((prevItems) => {
            const exists = prevItems.some(
                (item) => item.ItemCode === selectedItem.itemCode
            );

            if (exists) {
                return prevItems; // Evita duplicados
            }

            // Nuevo ítem con la estructura de DocumentLineItems
            const newOrderDetail: DocumentLineItems = {
                LineNum: prevItems.length, // Index automático
                ItemCode: selectedItem.itemCode,
                Quantity: 1,
                Currency:"$", // Ajustar según lógica
                CostingCode:"1", // Ajustar según lógica
                COGSCostingCode2:"1.8", // Ajustar según lógica
                Price: priceData.price,
                WarehouseCode: selectedItem.WarehouseCode,
                Description: selectedItem.name,
                IsRefrigerado: selectedItem.isRefrigerado
            };


            const updatedItems = [...prevItems, newOrderDetail];
            setItems(updatedItems);
            return updatedItems;
        });
    } catch (error) {
        toast.error(`No se pudo obtener el precio del artículo.${error}`);
    }
};
