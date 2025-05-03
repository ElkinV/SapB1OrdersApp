import { toast } from "react-toastify";
import { OrderDetails } from "../types.ts";
import { CONFIG, getToken } from "../../utils/utils.ts";

export const closeOrder = async (details: OrderDetails[] | null): Promise<void> => {
    const url = `http://${CONFIG.host}:3001/api/orders/close`;
    const token = getToken();

    if (!details || details.length === 0) {
        toast.error("No se proporcionaron detalles de la orden.");
        return;
    }

    const { docEntry, docNum } = details[0];

    if (!docEntry) {
        toast.error("No se encontró el docEntry.");
        return;
    }

    if (!token) {
        toast.error("No se encontró el token de autenticación. Por favor inicia sesión.");
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ docEntry }),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Captura el mensaje de error del backend si existe
            if (response.status === 401) {
                toast.error("No autorizado. Por favor inicia sesión nuevamente.");
            } else if (response.status === 404) {
                toast.error("Orden no encontrada en el servidor.");
            } else {
                toast.error(`Error al cerrar la orden. Código ${response.status}`);
                console.error(`Error de servidor: ${errorText}`);
            }
            return;
        }

        toast.success(`Orden ${docNum} cerrada exitosamente.`);
    } catch (err) {
        console.error("Error inesperado:", err);
        toast.error(
            err instanceof Error
                ? `Error de red al cerrar la orden: ${err.message}`
                : "Ocurrió un error inesperado al cerrar la orden."
        );
    }
};
