import { SkyScannerFlight } from '../interfaces/skyscanner';
import {
  FlightsQuery,
  instance as defaultFlightQuery,
} from '../query/FlightsQuery';

class FlightsManager {
  private readonly _flightsQuery: FlightsQuery;
  constructor(flightsQuery: FlightsQuery = defaultFlightQuery) {
    this._flightsQuery = flightsQuery;
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
    const departureAirports = await this.getTwoMainAirportsByListOfCities(
      departureCities
    );
    const destinationAirports = await this.searchAirportByCityName(destination);
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
          await this.getFlightsByListOfDepartureAirports(
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

  async getFlightsByListOfDepartureAirports(
    departureAirports: { code: string; name: string; city: string }[],
    destination: { code: string; name: string },
    options: { from: string; to: string }
  ) {
    const flights = [];
    for (const departureAirport of departureAirports) {
      try {
        console.log(
          `FLIGHTS MANAGER | getFlightsByListOfAirports | START | airport: ${departureAirport.name} | from: ${options.from} | to: ${options.to}  | destination: ${destination.name}`
        );
        const { data } = await this.searchFlights(
          departureAirport.code,
          destination.code,
          { date: options.from, returnDate: options.to }
        );
        const marshalledData = marshallFlightsForView(data);
        flights.push(...marshalledData);
      } catch (error: any) {
        console.log(
          `FLIGHTS MANAGER | getFlightsByListOfAirports | ERROR | ${error.message}`
        );
      }
    }
    return flights;
  }

  async searchFlights(
    origin: string,
    destination: string,
    options: { [key: string]: any }
  ) {
    const params = {
      origin,
      destination,
      cabinClass: 'economy',
      currency: 'EUR',
      filter: 'best',
      ...options,
    };

    const flights = await this._flightsQuery.searchFlights(params);
    return flights;
  }

  async searchAirportByCityName(city: string = '') {
    console.log(`FLIGHTS MANAGER | getAirportByCity | START | city: ${city}`);
    const params = {
      query: city,
    };
    const { data } = await this._flightsQuery.searchAirport(params);
    const airports = data.map((airport: any) => {
      return {
        code: airport.PlaceId,
        name: airport.PlaceName,
      };
    });
    airports.shift();
    return airports.slice(0, 2);
  }

  async getTwoMainAirportsByListOfCities(cities: string[] = []) {
    const airports: { code: string; name: string; city: string }[] = [];
    for (const city of cities) {
      try {
        console.log(
          `FLIGHTS MANAGER | getTwoMainAirportsByListOfCities | START | city: ${city}`
        );
        const params = {
          subType: 'AIRPORT',
          keyword: city,
          'page[limit]': 2,
          'page[offset]': 0,
        };
        const response = await this._flightsQuery.getAirportByCityName(params);
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
          `FLIGHTS MANAGER | getTwoMainAirportsByListOfCities | ERROR | ${error.message}`
        );
      }
    }
    return airports;
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

const getMarshalledLeg = (leg: any) => {
  return {
    origin: leg.origin.name,
    destination: leg.destination.name,
    departure: leg.departure,
    arrival: leg.arrival,
    duration: fromMinutesToHours(leg.duration),
    stopCount: leg.stop_count,
    stops: leg.stops.map((stop: any) => {
      return {
        name: stop.name,
        displayCode: stop.display_code,
      };
    }),
  };
};

const marshallFlightsForView = (flights: SkyScannerFlight[]) => {
  return flights
    .filter((flight: SkyScannerFlight) => {
      if (flight.price.amount > 1400) {
        return false;
      }
      return true;
    })
    .map((flight: SkyScannerFlight) => {
      const [wayIn, wayOut] = flight.legs;
      return {
        price: flight.price.amount,
        priceLastUpdate: flight.price.last_updated,
        wayIn: getMarshalledLeg(wayIn),
        wayOut: getMarshalledLeg(wayOut),
      };
    });
};
