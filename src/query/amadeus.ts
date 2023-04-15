import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const DEFAULT_AMADEUS_CONFIG = {
    apiURL: process.env.AMADEUS_API_URL,
    apiKey: process.env.AMADEUS_KEY,
    apiSecret: process.env.AMADEUS_SECRET,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    }
};

class Amadeus {
    _token: string;
    constructor() {
        this._token = ""
    }

    async getAccessToken() {
        try {
            console.log(`AMADEUS ADAPTER | getAccessToken | START`)
            const payload = {
                "grant_type": "client_credentials",
                "client_id": DEFAULT_AMADEUS_CONFIG.apiKey,
                "client_secret": DEFAULT_AMADEUS_CONFIG.apiSecret,
            }
            const endpoint = "security/oauth2/token"
            const { access_token } = await this.post(endpoint, payload)
            this._token = access_token
            console.log(`AMADEUS ADAPTER | getAccessToken | SUCCESS | access_token: ${access_token}`)
        } catch (error: any) {
            console.log(`AMADEUS ADAPTER | getAccessToken | ERROR | ${error.message}`)
            throw error
        }
    }

    async get(endpoint: string, params?: { [key: string]: any }) {
        if (!this._token) {
            await this.getAccessToken()
        }
        const options = {
            method: 'GET',
            url: `${DEFAULT_AMADEUS_CONFIG.apiURL}${endpoint}`,
            params,
            headers: {
                Authorization: `Bearer ${this._token}`
            }
        };
        return (await axios.request(options)).data;
    }

    async post(endpoint: string, payload: { [key: string]: any }, params?: { [key: string]: any }) {
        const options = {
            method: 'POST',
            url: `${DEFAULT_AMADEUS_CONFIG.apiURL}${endpoint}`,
            params,
            headers: DEFAULT_AMADEUS_CONFIG.headers,
            data: payload
        };
        return (await axios.request(options)).data;
    }
}

const instance = new Amadeus();
export { instance, Amadeus }
