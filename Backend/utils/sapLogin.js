import https from "https";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config();


export const serviceLayerUrl = process.env.SERVICE_LAYER_URL;
const serviceLayerUsername = process.env.SERVICE_LAYER_USERNAME;
const serviceLayerPassword = process.env.SERVICE_LAYER_PASSWORD;
export const agent = new https.Agent({rejectUnauthorized: false});


export async function loginToServiceLayer() {
    try {
        const response = await axios.post(`${serviceLayerUrl}Login`, {
            CompanyDB: process.env.SAP_COMPANY_DB,
            UserName: serviceLayerUsername,
            Password: serviceLayerPassword
        },{httpsAgent:agent});


        const serviceLayerSession = response.data.SessionId;
        console.log(serviceLayerSession);
        console.log('Logged in to Service Layer successfully');
        return serviceLayerSession
    } catch (error) {
        console.log(serviceLayerUsername);
        console.error('Error logging in to Service Layer:', error.message);
        throw error;
    }
}

export async function logoutToServiceLayer(token) {
    try {
        const url = `${serviceLayerUrl}Logout`;
        const headers = { "Cookie": "B1SESSION=" + token + "; ROUTEID=.node4" };
        const response = await axios.post(url, {}, { headers: headers, httpsAgent: agent });
        //serviceLayerSession = null;
        console.log('Logged out from Service Layer successfully');
    } catch (error) {
        console.log(serviceLayerUsername);
        console.error('Error logging out from Service Layer:', error.message);
        throw error;
    }
}
