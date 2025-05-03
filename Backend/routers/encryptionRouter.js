import express from 'express'
import {decrypt, encrypt} from "../utils/encryptUtils.js";
import {expressjwt} from "express-jwt";
import dotenv from "dotenv";
dotenv.config();

let encryptRouter = express.Router()
const secret = process.env.JWT_KEY;

encryptRouter.use(express.json());

encryptRouter.post('/encrypt',expressjwt ({ secret, algorithms: ['HS256'] }), (req, res) => {
    const { text, key } = req.body;
    if (!text || !key) {
        return res.status(400).json({ error: 'Text and encryption key are required' });
    }
    try {
        const encryptedText = encrypt(text, key);
        res.json({ encrypted: encryptedText });
    } catch (error) {
        res.status(500).json({ error: 'Encryption failed' });
    }
});

encryptRouter.post('/decrypt',expressjwt ({ secret, algorithms: ['HS256'] }), (req, res) => {
    const { encryptedText, key } = req.body;
    if (!encryptedText || !key) {
        return res.status(400).json({ error: 'Encrypted text and encryption key are required' });
    }
    try {
        const decryptedText = decrypt(encryptedText, key);
        res.json({ decrypted: decryptedText });
    } catch (error) {
        res.status(400).json({ error: 'Invalid encrypted text or key' });
    }
});

encryptRouter.get('/', expressjwt ({ secret, algorithms: ['HS256'] }),(req, res) => {
    res.send('Hola');
})

export default encryptRouter;