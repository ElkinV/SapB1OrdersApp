import express from "express";
import sapQuery from "../utils/odbcSap.js";
import {expressjwt} from "express-jwt";
import dotenv from "dotenv";
dotenv.config();

let customerRouter = express.Router();
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const secret = process.env.JWT_KEY;

customerRouter.get('/list', expressjwt ({ secret, algorithms: ['HS256'] }),async (req, res) => {
    const search = req.query.search;
    try {
        // Si el término de búsqueda contiene un asterisco explícito, lo usamos tal cual
        // Si no, agregamos asteriscos al principio y al final
        const searchTerm = search && !search.includes('*') ? `%${search}%` : search;
        
        const result= await sapQuery(connectionString, schema,`SELECT  OCRD."CardCode", OCRD."CardName", OCRD."CardType", OCRD."ListNum", replace(OPLN."ListName", \'Lista\', \'\'  )as "margen" FROM OCRD INNER JOIN OPLN  ON OCRD ."ListNum" = OPLN."ListNum" WHERE "CardType"=\'C\' ${searchTerm ? `AND (LOWER("CardName") LIKE LOWER('${searchTerm}') OR LOWER("CardCode") = LOWER('${search}'))` : ''} ORDER BY "CardName"`);
        console.log(result);

        const items = result.map(item => ({
            id: item.CardCode,
            name: item.CardName,
            priceList: item.ListNum,
            margen: item.margen.trimStart(),
        }));

        res.json(items);
    } catch (error) {
        console.error('Error in /api/customers:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

export default customerRouter;