import express from "express"

class Test {
  constructor(app: express.Application) {
    app.get('/', (req , res) => {
      res.send({ message: 'IZI CARAMEL' });
    });

  }
}

export { Test };
