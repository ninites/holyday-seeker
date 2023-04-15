import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_CONFIG = {
  apiURL: process.env.SKY_SCANNER_API_URL,
  headers: {
    'X-RapidAPI-Key': process.env.SKY_SCANNER_KEY,
    'X-RapidAPI-Host': process.env.SKY_SCANNER_HOST
  },
};

class SkyScanner {
  constructor() { }

  async get(endpoint: string, params: { [key: string]: any }) {
    const options = {
      method: 'GET',
      url: `${DEFAULT_CONFIG.apiURL}${endpoint}`,
      headers: DEFAULT_CONFIG.headers,
      params,
    };
    return (await axios.request(options)).data;
  }
}

const instance = new SkyScanner();
export { instance, SkyScanner }
