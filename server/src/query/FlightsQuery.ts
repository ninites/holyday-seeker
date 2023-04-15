import {
  AmadeusAdapter,
  instance as defaultAmadeusAdapter,
} from '../adapter/amadeus';
import {
  SkyScannerAdapter,
  instance as defaultSkyScannerAdapter,
} from '../adapter/skyscanner';

class FlightsQuery {
  private readonly _amadeusAdapter: AmadeusAdapter;
  private readonly _skyscannerAdapter: SkyScannerAdapter;
  constructor(
    amadeusAdapter: AmadeusAdapter = defaultAmadeusAdapter,
    skyscannerAdapter: SkyScannerAdapter = defaultSkyScannerAdapter
  ) {
    this._amadeusAdapter = amadeusAdapter;
    this._skyscannerAdapter = skyscannerAdapter;
  }

  async searchFlights(params: { [key: string]: any }) {
    const endpoint = 'searchFlights';
    const flights = await this._skyscannerAdapter.get(endpoint, params);
    return flights;
  }

  async searchAirport(params: { [key: string]: any }) {
    const endpoint = 'searchAirport';
    const airports = await this._skyscannerAdapter.get(endpoint, params);
    return airports;
  }

  async getAirportByCityName(params: { [key: string]: any }) {
    const endpoint = 'reference-data/locations';
    const response = await this._amadeusAdapter.get(endpoint, params);
    return response;
  }

  async getAirportByLocation(params: { [key: string]: any }) {
    const endpoint = 'reference-data/locations/airports';
    const response = await this._amadeusAdapter.get(endpoint, params);
    return response;
  }
}

const instance = new FlightsQuery();
export { instance, FlightsQuery };
