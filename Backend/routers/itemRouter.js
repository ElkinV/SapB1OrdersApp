import express from "express";
import {expressjwt} from "express-jwt";
import sapQuery from "../utils/odbcSap.js";


let itemRouter = express.Router();
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const secret = process.env.JWT_KEY;

itemRouter.get('/', expressjwt ({ secret, algorithms: ['HS256'] }),async (req, res) => {
    const search = req.query.search; // Capturamos el término de búsqueda del query string

    try {
        // Si el término de búsqueda contiene un asterisco explícito, lo usamos tal cual
        // Si no, agregamos asteriscos al principio y al final
        const searchTerm = search && !search.includes('*') ? `%${search}%` : search;
        
        const query = `SELECT "ItemCode", "ItemName", CASE WHEN "QryGroup1"='N' THEN FALSE WHEN "QryGroup1"= 'Y' THEN TRUE ELSE null END as "isRefrigerado" FROM "OITM" 
                              WHERE "frozenFor" = 'N' ${searchTerm ? `AND (LOWER("ItemName") LIKE LOWER('${searchTerm}') OR LOWER("ItemCode") = LOWER('${search}'))` : ''}
                              ORDER BY "ItemName"`;

        const result = await sapQuery(connectionString, schema, query);
        console.log('Query executed successfully');

        const items = result.map(item => ({
            itemCode: item.ItemCode,
            name: item.ItemName,
            isRefrigerado: (Number(item.isRefrigerado)? true : false),
            WarehouseCode:'001'
        }));

        res.json(items);
    } catch (error) {
        console.error('Error in /api/items:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

itemRouter.get("/margen", async(req, res) => {
    const {ItemCode, ItemPrice} = req.query;
    console.log(ItemCode, ItemPrice);

    try {
        const query = `SELECT ( ( ${ItemPrice} - (CASE COALESCE(B."WhsCode",'') WHEN '001' THEN (CASE COALESCE(P."Price",0) WHEN 0 THEN B."AvgPrice" ELSE P."Price" END) ELSE (CASE COALESCE(B."AvgPrice",0) WHEN 0 THEN P."Price" ELSE B."AvgPrice" END) END) ) / (CASE WHEN COALESCE(25000,0)=0 THEN 1 ELSE 25000 END)) * 100 "Margen" FROM ITM1 P LEFT JOIN OITW B  ON P."ItemCode" = B."ItemCode"  AND 001 = B."WhsCode" WHERE P."ItemCode"= ${ItemCode} AND P."PriceList"=1`
        const result = await sapQuery(connectionString, schema,query )

        const margen = result[0].Margen

        res.json(result)

        console.log(margen)

    }catch(error) {
        console.log(error);
    }

})

itemRouter.get('/price',  expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const { itemCode, priceList } = req.query; // Capturamos itemCode y priceList del query string

    try {
        const result = await sapQuery(connectionString, schema,`SELECT "Price" FROM "ITM1" WHERE "ItemCode" = ? AND "PriceList" = ?`, [itemCode, priceList] );
        console.log('Query executed successfully');

        if (result.length > 0) {
            res.json({ price: result[0].Price });
        } else {
            res.status(404).json({ error: 'Price not found' });
        }

    } catch (error) {
        console.error('Error in /api/item-price:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});
export default itemRouter;