import express from "express";
import dotenv from "dotenv";
import {decrypt, encrypt} from "../utils/encryptUtils.js";
import sapQuery from "../utils/odbcSap.js";
import  jwt from 'jsonwebtoken'
import {expressjwt} from "express-jwt";


dotenv.config();

let authRouter = express.Router();
const encryptKey = process.env.KEY_AES;
const connectionString = process.env.DB_CONNECTION_STRING;
const schema = process.env.SAP_COMPANY_DB;
const jwtKey = process.env.JWT_KEY;
const secret = process.env.JWT_KEY;


authRouter.post('/login',async (req, res) => {
    const { username, password } = req.body;
    console.log(password);

    let tokenjwt;
    try{
        const result = await sapQuery(connectionString, schema, 'SELECT "U_RL_ClaveWeb" AS "ClaveWeb", "USER_CODE" AS "Username" FROM OUSR WHERE "USER_CODE" = $1',
            [username])
        console.log("result", result)
        let credentials = result[0]
        console.log(credentials)
        let encryptedPassword = credentials.ClaveWeb.toString()
        const decryptedPassword = decrypt(encryptedPassword, encryptKey)

        const user = {
            username: username,
            password: encryptedPassword,
        }

        tokenjwt= jwt.sign(user , jwtKey , {algorithm: 'HS256', expiresIn: '12h'});

        if (username === credentials.Username && password === decryptedPassword) {
            res.json({encryptedPassword: encryptedPassword,token: tokenjwt });
        } else {
            res.status(401).json({ error: 'Credenciales inválidas' });
        }
    }catch(error){
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error login', details: error.message });
    }
});

authRouter.post('/logout',expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    res.json({ message: 'Logout successful' });

})

authRouter.post('/change-password',expressjwt ({ secret, algorithms: ['HS256'] }), async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    try {

        const result = await sapQuery(connectionString, schema,'SELECT "U_RL_ClaveWeb" "ClaveWeb" FROM "OUSR" WHERE "USER_CODE" = ?', [username]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const encryptedPassword = result[0].ClaveWeb;
        const decryptedPassword = decrypt(encryptedPassword, encryptKey); // Desencriptar la clave

        // Comparar la clave anterior con la clave desencriptada
        if (oldPassword !== decryptedPassword) {
            return res.status(401).json({ error: 'Old password is incorrect' });
        }

        // Comparar la nueva clave con la confirmación
        if (newPassword !== req.body.confirmPassword) {
            return res.status(400).json({ error: 'New password and confirmation do not match' });
        }

        // Cifrar la nueva clave
        const newEncryptedPassword = encrypt(newPassword, encryptKey);

        await sapQuery(connectionString, schema, 'UPDATE "OUSR" SET "U_RL_ClaveWeb" = ? WHERE "USER_CODE" = ?',[newEncryptedPassword, username] )

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});




authRouter.get('/get-userid',expressjwt ({ secret, algorithms: ['HS256'] }) ,async (req, res) => {
    const { username } = req.query; // Capturamos el username del query string

    try {
        const result = await sapQuery(connectionString, schema, `SELECT "USERID" FROM "OUSR" WHERE "USER_CODE" = ?`, [username]);

        if (result.length > 0) {
            res.json({ USERID: result[0].USERID });
        } else {
            res.status(404).json({ error: 'USERID not found' });
        }
    } catch (error) {
        console.error('Error in /api/get-userid:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

authRouter.post('/signup', async (req, res) => {
    const {password } = req.body;

    jwt.sign(password , jwtKey , (err,token) => {
        if(err){
            res.status(400).send({msg : 'Error'})
        }
        else {
            res.send({msg:'success' , token: token})
        }
    })
})

authRouter.post('/verify-token', async (req, res) => {
    const {tokenToVerify} = req.body;
    console.log("TOKEN", tokenToVerify);

    jwt.verify(tokenToVerify, jwtKey, (err,token) => {
        if(err){
            res.status(400).send({msg : 'Error'})
        }
        else {
            res.send({msg:'success' , token: token})
        }
    })
})
export default authRouter;