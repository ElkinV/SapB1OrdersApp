import express, {response} from "express";
import dotenv from "dotenv";
import {agent, loginToServiceLayer, logoutToServiceLayer, serviceLayerUrl} from "../utils/sapLogin.js";
import axios from "axios";
import sapQuery from "../utils/odbcSap.js";
import {expressjwt} from "express-jwt";
dotenv.config();


let orderRouter = express.Router();
let token = null
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const secret = process.env.JWT_KEY;


orderRouter.post("/close",expressjwt({secret, algorithms: ['HS256']}), async (req, res) => {
    const { docEntry } = req.body;


    // Asegúrate de que docEntry esté correctamente recibido en el cuerpo de la solicitud
    if (!docEntry) {
        return res.status(400).json({ error: 'docEntry es requerido' });
    }

    try {

        // Asegúrate de que loginToServiceLayer() devuelva el token correctamente
        const token = await loginToServiceLayer();
        if (!token) {
            return res.status(500).json({ error: 'No se pudo obtener el token de sesión' });
        }

        // Usa docEntry correctamente en la URL
        const url = `${serviceLayerUrl}Orders(${docEntry})/Close`;
        console.log("ENTRY", docEntry);  // Imprime el valor de docEntry

        const response = await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `B1SESSION=${token}`,
                'Accept': '*/*',
            },
            httpsAgent: agent,  // Usa el agente HTTPS si es necesario
        });

        console.log('Response:', response.data);  // Log de la respuesta para depuración

        await logoutToServiceLayer(token);
        return res.status(200).json({ message: 'Orden cerrada exitosamente', result: response.data });
    }catch(error){
        console.log(error);
    }
});

orderRouter.patch("/edit", expressjwt({ secret, algorithms: ["HS256"] }), async (req, res) => {
    try {
        let token = await loginToServiceLayer();
        const { docEntry, items } = req.body;

        console.log(items, docEntry);
        const url = `${serviceLayerUrl}Orders(${docEntry})`;

        if (!token) {
            return res.status(500).json({ error: "No se pudo obtener el token de sesión" });
        }

        // Obtener la orden actual
        const responseOrder = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                "Cookie": `B1SESSION=${token}`,
                "Accept": "*/*",
            },
            httpsAgent: agent,
        });

        let orderObject = responseOrder.data;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No se proporcionaron elementos para actualizar" });
        }

        if (!orderObject.DocumentLines || orderObject.DocumentLines.length === 0) {
            return res.status(400).json({ error: "No hay líneas de documento en la orden" });
        }

        // Modificar la orden
        delete orderObject.DocTotal;
        delete orderObject.DocTotalSys;
        delete orderObject.PriceList; // Muy importante si estás usando listas

        // Paso 1: Eliminar líneas que ya no existen
        orderObject.DocumentLines = orderObject.DocumentLines.filter(line =>
            items.some(item => item.LineNum === line.LineNum)
        );

// Paso 2: Actualizar las líneas existentes
        orderObject.DocumentLines = orderObject.DocumentLines.map(line => {
            const itemToUpdate = items.find(i => i.LineNum === line.LineNum);
            if (itemToUpdate) {
                return {
                    ...line,
                    Quantity: itemToUpdate.Quantity,
                    Price: itemToUpdate.Price,
                    UnitPrice: itemToUpdate.Price,
                    PriceAfterVAT: itemToUpdate.Price
                };
            }
            return line;
        });

// Paso 3: Agregar nuevas líneas (que no existían antes)
        const existingLineNums = orderObject.DocumentLines.map(line => line.LineNum);
        const newItems = items.filter(item => item.LineNum === undefined || !existingLineNums.includes(item.LineNum));

        newItems.forEach(item => {
            orderObject.DocumentLines.push({
                LineNum: orderObject.DocumentLines.length,
                ItemCode: item.ItemCode,
                Quantity: item.Quantity,
                Price: item.Price,
                UnitPrice: item.Price,
                PriceAfterVAT: item.Price,
                Currency: item.Currency,
                CostingCode: item.CostingCode,
                COGSCostingCode2: item.COGSCostingCode2,
                WarehouseCode: '001'
            });
        });


        let orderData = JSON.stringify(orderObject);
        console.log("ORDER DATA", orderData);

        // Actualizar la orden en SAP
        const responsePut = await axios.put(url, orderData, {
            headers: {
                "Content-Type": "application/json",
                "Cookie": `B1SESSION=${token}`,
                "Accept": "*/*",
            },
            httpsAgent: agent,
        });

        await logoutToServiceLayer(token);

        return res.status(201).json({ message: "Orden Actualizada", result: responsePut.data });

    } catch (error) {
        console.error("Error ", error.message);
        return res.status(500).json({ error: error.message });
    }
});


orderRouter.post('/', expressjwt ({ secret, algorithms: ['HS256'] }),async (req, res) => {
    try {
        token = await loginToServiceLayer();

        const { cardCode, items, comments, user ,series} = req.body;

        // Función para formatear la fecha en formato yyyymmdd
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        let orderData = {
            TaxDate: formatDate(new Date()), // Usar la función para obtener la fecha formateada
            DocDueDate: formatDate(new Date()),
            CardCode: cardCode,
            DocCurrency: "$",
            Series: series,
            Rate: 0.0,
            Comments: comments,
            U_RL_Origen: "WEBAPP",
            U_RL_Usuario: user,
            DocumentLines: items.map(item => ({
                ItemCode: item.itemCode,
                Quantity: item.quantity,
                UnitPrice: item.unitPrice,
                COGSCostingCode: "2",
                CostingCode2: "2.1",
                U_RL_Margen: item.U_RL_Margen,
            }))
        };

        console.log(JSON.stringify(orderData));
        orderData = JSON.stringify(orderData);

        const response = await axios.post(`${serviceLayerUrl}Orders/`, orderData, {
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `B1SESSION=${token}`,
                'Accept': '*/*'
            },
            httpsAgent: agent
        });

        console.log("POST: " + response);
        console.log('Order created in SAP HANA:', response.data);

        // Realiza el logout después de crear el pedido
        await logoutToServiceLayer(token);

        res.status(201).json({ message: 'Order created successfully', sapOrderId: response.data.DocEntry });
    } catch (error) {
        console.error('Error creating order in SAP HANA:', error.response.data.error );

        // Manejo de errores para extraer detalles del Service Layer
        let errorMessage = 'Error creating order';
        if (error.response && error.response.data) {
            // Si hay un mensaje de error del Service Layer, usarlo
            errorMessage = error.response.data.error || errorMessage;
        }

        res.status(500).json({ error: errorMessage, details: error.message });
    }
});


orderRouter.get('/list',expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const { userId } = req.query; // Capturamos el USERID del query string

    try {
        const result = await sapQuery(connectionString, schema,`SELECT top 20 "Series","CardCode", "CardName" AS "CustomerName" , "DocDate", "DocNum", CASE WHEN "DocStatus" = \'C\' THEN \'Cerrado\' WHEN "DocStatus"= \'O\' THEN \'Abierto\' ELSE \'N/A\' END as Status FROM "ORDR" WHERE "U_RL_Origen" =\'WEBAPP\' and  "U_RL_Usuario" = \'${userId}\' ORDER BY "DocDate" desc` )
        const orders = result.map(item => ({
            cardCode: item.CardCode,
            customerName: item.CustomerName,
            date: item.DocDate,
            docNum: item.DocNum,
            docStatus: item.STATUS,
            series: item.Series
        }));

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }
});

orderRouter.get("/itemByOrder",expressjwt({secret, algorithms: ['HS256']}), async (req, res) => {
    const {docEntry} = req.query;
    const query = `SELECT "ItemCode", "Quantity", "Price" FROM rdr1 WHERE "DocEntry" = ${docEntry}`
    let counter = 0

    try {
        const result = await sapQuery(connectionString, schema,query)

        let items = result.map((item, index) => ({
            "LineNum": index,
            "ItemCode": item.ItemCode,
            "Quantity": item.Quantity,
            "Currency": "$",
            "CostingCode": "1",
            "COGSCostingCode2": "1.8",
            "Price": item.Price
        }));

        res.json(items)

    }catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({error: 'Error fetching orders', details: error.message})
    }
});

orderRouter.get('/details',expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const {orderId} = req.query;
    const query = `SELECT  ORDR."DocStatus" ,ORDR."DocEntry" ,ORDR."CardCode",PaymentInfo."PymntGroup", OCRD."ListNum" ,OCRD."U_RL_DIASCOTIZA" AS "VigenciaOrdr", RDR1."ItemCode", RDR1."VatPrcnt", ORDR."Comments", OITM."U_RL_Cod_Cum" AS "Cum", OITM."U_RL_Reg_Inv" AS "Invima", TO_DATE(ORDR."DocDate") AS "DocDate", RDR1."Dscription", RDR1."Quantity", RDR1."U_RL_Margen", ExpData."U_RL_Vence", ExpData."U_RL_VenceMes", ORDR."DocNum", ORDR."U_RL_Origen", OCRD."U_HBT_MailRecep_FE", ORDR."CardName", ORDR."LicTradNum", OCRD."City", OCRD."Address", OCRD."E_Mail" AS email, OCRD."Phone1", OSLP."SlpName", CASE WHEN ORDR."Series" = 13 THEN 'PediClie' WHEN ORDR."Series" = 83 THEN 'Cotiza' ELSE 'NA' END AS "Series", RDR1."Price" AS "Precio", ORDR."VatSum", ORDR."DocTotal", (ORDR."DocTotal" - ORDR."VatSum") AS "TotalAntesDeImpuestos", UserData."NombreUsuario" FROM RDR1 INNER JOIN ORDR ON ORDR."DocEntry" = RDR1."DocEntry" INNER JOIN OCRD ON OCRD."CardCode" = ORDR."CardCode" AND OCRD."CardType" = 'C' INNER JOIN ITM1 ON ITM1."ItemCode" = RDR1."ItemCode" AND ITM1."PriceList" = OCRD."ListNum" INNER JOIN OSLP ON OSLP."SlpCode" = RDR1."SlpCode" INNER JOIN OITM ON OITM."ItemCode" = RDR1."ItemCode" LEFT JOIN ( SELECT "ItemCode", CAST(MIN("ExpDate") AS DATE) AS "U_RL_Vence", TO_VARCHAR(MONTHS_BETWEEN(CURRENT_DATE, MIN("ExpDate"))) || ' MESES' AS "U_RL_VenceMes" FROM OIBT WHERE "Quantity" > 0 AND "ExpDate" > CURRENT_DATE AND "WhsCode" = '001' GROUP BY "ItemCode") ExpData ON ExpData."ItemCode" = RDR1."ItemCode" LEFT JOIN ( SELECT ORDR."DocNum", OCTG."PymntGroup" FROM OCTG INNER JOIN ORDR ON ORDR."GroupNum" = OCTG."GroupNum") PaymentInfo ON PaymentInfo."DocNum" = ORDR."DocNum" LEFT JOIN (SELECT DISTINCT "USERID", "U_NAME" AS "NombreUsuario"FROM OUSR) UserData ON UserData."USERID" = ORDR."U_RL_Usuario" WHERE ORDR."DocNum" = ${orderId}`;

    try {
        const result = await sapQuery(connectionString, schema, query )
        const details = result.map(item => ({
            cardCode: item.CardCode,
            cardName: item.CardName,
            itemCode: item.ItemCode,
            description: item.Dscription,
            quantity: item.Quantity,
            price: item.Precio,
            margen: item.U_RL_Margen,
            total: parseInt(item.Quantity) * (item.Precio),
            vence: item.U_RL_Vence,
            venceMes: item.U_RL_VenceMes,
            series: item.Series,
            totalAntesDeImpuestos: item.TotalAntesDeImpuestos,
            impuesto: item.VatSum,
            totalOrdn: item.DocTotal,
            direccion: item.Address,
            email: item.EMAIL,
            vendedor: item.SlpName,
            nit: item.LicTradNum,
            city: item.City,
            telefono: item.Phone1,
            u_name: item.NombreUsuario,
            comments: item.Comments,
            docNum: item.DocNum,
            docDate: item.DocDate,
            cum: item.Cum,
            regInvima: item.Invima,
            IVA: item.VatPrcnt,
            formaDePago: item.PymntGroup,
            vigenciaOrdr: item.VigenciaOrdr,
            docEntry: item.DocEntry,
            docStatus : item.DocStatus,
            listNum: item.ListNum
        }));

        res.json(details);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders', details: error.message });
    }

});
export default orderRouter;

