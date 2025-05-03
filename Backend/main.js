import express from 'express';

import cors from 'cors';
import dotenv from 'dotenv';
import { expressAnalytics } from 'node-api-analytics';
import encryptRouter from "./routers/encryptionRouter.js";
import authRouter from "./routers/authRouter.js";
import orderRouter from "./routers/orderRouter.js";
import itemRouter from "./routers/itemRouter.js";
import customerRouter from "./routers/customerRouter.js";

dotenv.config();

const app = express();
const port = 3001;
const connectionString = process.env.DB_CONNECTION_STRING;
const host = "0.0.0.0"




app.use(cors());

app.use(express.json());
app.use(expressAnalytics(process.env.API_ANALYTICS_KEY));
app.use('/api/encryption', encryptRouter)
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/items', itemRouter);
app.use('/api/customers', customerRouter);

app.listen(port,host ,() => {
    console.log(`Server running on port ${port}`);
    console.log('Database connection string:', connectionString);
});

app.get('/', (req, res) => {
    res.send("Main");
})