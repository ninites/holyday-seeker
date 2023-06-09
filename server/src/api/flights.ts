import express from 'express';
import {
  FlightsManager,
  instance as defaultFlightManager,
} from '../services/flights-manager';

const ROUTE = '/flights';

class FlightsApi {
  private readonly _app: express.Application;
  private readonly _flightsManager: FlightsManager;
  constructor(
    app: express.Application,
    flightsManager: FlightsManager = defaultFlightManager
  ) {
    this._app = app;
    this._flightsManager = flightsManager;
    this.routes();
  }

  routes() {
    this._app.get(`${ROUTE}/`, async (req, res) => {
      try {
        const from = req.query.from as string;
        const to = req.query.to as string;
        const destination = req.query.destination as string;
        const departureCities = req.query.departureCities
          ? JSON.parse(req.query.departureCities as string)
          : [];
        if (!from || !to || !destination || departureCities.length === 0) {
          throw new Error('Missing params');
        }
        const result = await this._flightsManager.getEuropeanFlights(
          from,
          to,
          departureCities,
          destination
        );
        res.send(result);
      } catch (error: any) {
        res.status(500).send(error.message);
      }
    });
  }
}

export { FlightsApi };
