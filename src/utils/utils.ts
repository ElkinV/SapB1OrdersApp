// utils.ts
const host = 'host'
const API = 'api-url'
export const getToken = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  return null;
};

export const CONFIG = {
    host: '152.200.153.166',
    apiEndpoint: 'http://152.200.153.166:3001'
};
