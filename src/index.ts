import express from 'express';
import { Test } from './api/test';

class Server {
  server: express.Application;
  testAPI!: Test;
  constructor() {
    this.server = express();
    this.initRouting();
    this.launch();
  }

  initRouting() {
    new Test(this.server);
  }

  launch(): void {
    const port = 3000;
    this.server.listen(port);
    console.log('SERVER RUNNING on PORT' + port);
  }
}

new Server();
