import { SkyScannerFlights } from '../interfaces/skyscanner';
import { Amadeus, instance as defaultAmadeusAdapter } from '../query/amadeus';
import {
  SkyScanner,
  instance as defaultSkyScannerAdapter,
} from '../query/skyscanner';

class FlightsManager {
  _amadeusAdapter: Amadeus;
  _skyScannerAdapter: SkyScanner;
  constructor(
    amadeusAdapter: Amadeus = defaultAmadeusAdapter,
    skyScannerAdapter: SkyScanner = defaultSkyScannerAdapter
  ) {
    this._amadeusAdapter = amadeusAdapter;
    this._skyScannerAdapter = skyScannerAdapter;
  }

  async getEuropeanFlights(
    from: string = '',
    to: string = '',
    departureCities: string[] = [],
    destination: string = ''
  ) {
    console.log(
      `FLIGHTS MANAGER | getEuropeanFlights | START | from: ${from} | to: ${to}  | destination: ${destination}`
    );
    const departureAirports = await this.getAirportsByListOfCities(
      departureCities
    );
    const destinationAirports = await this.getAirportByCity(destination);
    const flights = await this.getFlightsSortedByPrice(
      departureAirports,
      destinationAirports,
      {
        from,
        to,
      }
    );
    console.log(
      `FLIGHTS MANAGER | getEuropeanFlights | SUCCESS | FLIGHTS: ${flights.length}`
    );
    return flights;
  }

  async getFlightsSortedByPrice(
    departureAirports: { code: string; name: string; city: string }[],
    destinationAirports: { code: string; name: string }[],
    options: { from: string; to: string }
  ) {
    const flights = [];
    for (const destinationAirport of destinationAirports) {
      console.log(
        `FLIGHTS MANAGER | getFlights | START | DESTINATION AIRPORT = ${destinationAirport.name}`
      );
      try {
        const flightsForDestinationAirport =
          await this.getFlightsByListOfStartAirports(
            departureAirports,
            destinationAirport,
            options
          );
        flights.push(...flightsForDestinationAirport);
      } catch (error: any) {
        console.log(`FLIGHTS MANAGER | getFlights | ERROR | ${error.message}`);
      }
    }
    return flights.sort((a, b) => {
      return a.price - b.price;
    });
  }

  async getFlightsByListOfStartAirports(
    airports: { code: string; name: string; city: string }[],
    destination: { code: string; name: string },
    options: { from: string; to: string }
  ) {
    const flights = [];
    for (const airport of airports) {
      try {
        console.log(
          `FLIGHTS MANAGER | getFlightsByListOfAirports | START | airport: ${airport.name} | from: ${options.from} | to: ${options.to}  | destination: ${destination.name}`
        );
        const endpoint = 'searchFlights';
        const params = {
          origin: airport.code,
          destination: destination.code,
          date: options.from,
          returnDate: options.to,
          cabinClass: 'economy',
          currency: 'EUR',
          filter: 'best',
        };
        const { data } = await this._skyScannerAdapter.get(endpoint, params);
        const marshalledData = data
          .filter((flight: SkyScannerFlights) => {
            if (flight.price.amount > 1400) {
              return false;
            }
            return true;
          })
          .map((flight: SkyScannerFlights) => {
            const [wayIn, wayOut] = flight.legs;
            return {
              price: flight.price.amount,
              priceLastUpdate: flight.price.last_updated,
              wayIn: {
                origin: wayIn.origin.name,
                destination: wayIn.destination.name,
                departure: wayIn.departure,
                arrival: wayIn.arrival,
                duration: fromMinutesToHours(wayIn.duration),
                stopCount: wayIn.stop_count,
                stops: wayIn.stops.map((stop) => {
                  return {
                    name: stop.name,
                    displayCode: stop.display_code,
                  };
                }),
              },
              wayOut: {
                origin: wayOut.origin.name,
                destination: wayOut.destination.name,
                departure: wayOut.departure,
                arrival: wayOut.arrival,
                duration: fromMinutesToHours(wayOut.duration),
                stopCount: wayOut.stop_count,
                stops: wayOut.stops.map((stop) => {
                  return {
                    name: stop.name,
                    displayCode: stop.display_code,
                  };
                }),
              },
            };
          });
        flights.push(...marshalledData);
      } catch (error: any) {
        console.log(
          `FLIGHTS MANAGER | getFlightsByListOfAirports | ERROR | ${error.message}`
        );
      }
    }
    return flights;
  }

  async getAirportByCity(city: string = '') {
    console.log(`FLIGHTS MANAGER | getAirportByCity | START | city: ${city}`);
    const endpoint = 'searchAirport';
    const params = {
      query: city,
    };
    const { data } = await this._skyScannerAdapter.get(endpoint, params);
    const airports = data.map((airport: any) => {
      return {
        code: airport.PlaceId,
        name: airport.PlaceName,
      };
    });
    airports.shift();
    return airports.slice(0, 2);
  }

  async getAirportsByListOfCities(cities: string[] = []) {
    const airports: { code: string; name: string; city: string }[] = [];
    for (const city of cities) {
      try {
        console.log(
          `FLIGHTS MANAGER | getAirportsByListOfCities | START | city: ${city}`
        );
        const endpoint = 'reference-data/locations';
        const params = {
          subType: 'AIRPORT',
          keyword: city,
          'page[limit]': 2,
          'page[offset]': 0,
        };
        const response = await this._amadeusAdapter.get(endpoint, params);
        const { data } = response;
        data.forEach((airport: any) => {
          airports.push({
            code: airport.iataCode,
            name: airport.name,
            city: airport.address.cityName,
          });
        });
        await delay(1000);
      } catch (error: any) {
        console.log(
          `FLIGHTS MANAGER | getAirportsByListOfCities | ERROR | ${error.message}`
        );
      }
    }
    return airports;
  }

  async getAirportsByLatitudeAndLongitude(
    latitude: number,
    longitude: number
  ): Promise<{ [key: string]: any }[]> {
    try {
      console.log(`FLIGHTS MANAGER | getAirports | START`);
      const endpoint = 'reference-data/locations/airports';
      const params = {
        latitude,
        longitude,
        radius: 500,
        'page[limit]': 20,
        'page[offset]': 0,
      };
      const airports: { [key: string]: any }[] = [];
      let totalCount = 0;
      do {
        const response = await this._amadeusAdapter.get(endpoint, params);
        const { data, meta } = response;
        totalCount = meta.count;
        console.log(
          `FLIGHTS MANAGER | getAirports | totalCount: ${totalCount}`
        );
        data.forEach((airport: any) => {
          airports.push({
            code: airport.iataCode,
            name: airport.name,
            city: airport.address.cityName,
          });
        });
        params['page[offset]'] += params['page[limit]'];
      } while (airports.length < totalCount);
      console.log(`FLIGHTS MANAGER | getAirports | SUCCESS `);
      return airports;
    } catch (error: any) {
      console.log(`FLIGHTS MANAGER | getAirports | ERROR | ${error.message}`);
      return [];
    }
  }
}

const instance = new FlightsManager();
export { instance, FlightsManager };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const fromMinutesToHours = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const minutesLeft = minutes % 60;
  return `${hours}h ${minutesLeft}m`;
};
