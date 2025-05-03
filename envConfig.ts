import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    dbConnectionString: string;
    dbUsername: string;
    dbPassword: string;
    serviceLayerUrl: string;
    serviceLayerUsername: string;
    serviceLayerPassword: string;
    sapCompanyDb: string;
    keyAes: string;
    host: string;
}

const envConfig: EnvConfig = {
    dbConnectionString: process.env.DB_CONNECTION_STRING || '',
    dbUsername: process.env.DB_USERNAME || '',
    dbPassword: process.env.DB_PASSWORD || '',
    serviceLayerUrl: process.env.SERVICE_LAYER_URL || '',
    serviceLayerUsername: process.env.SERVICE_LAYER_USERNAME || '',
    serviceLayerPassword: process.env.SERVICE_LAYER_PASSWORD || '',
    sapCompanyDb: process.env.SAP_COMPANY_DB || '',
    keyAes: process.env.KEY_AES || '',
    host: process.env.HOST || ''
};

export default envConfig;