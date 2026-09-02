// Punto de entrada para Vercel: expone la app de Express como función
// serverless. No usa app.listen() (eso solo corre en local vía src/server.js).
require("dotenv").config();

const app = require("../src/app");

module.exports = app;
