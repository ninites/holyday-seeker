import express from 'express';
import cors from 'cors';
import { FlightsApi } from './api/flights';
class Server {
  server: express.Application;
  constructor() {
    this.server = express();
    this.server.use(cors());
    this.initRouting();
    this.launch();
  }

  initRouting() {
    new FlightsApi(this.server);
  }

  launch(): void {
    const port = 8000;
    this.server.listen(port);
    console.log('SERVER RUNNING on PORT' + port);
  }
}

new Server();
