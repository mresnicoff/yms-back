const truckService =
  require("./truck.service");
const { sendError } = require("../../lib/errors");

async function getAll(req, res) {

  try {

    const data =
      await truckService.getAll();

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los camiones.");

  }

}

async function create(req, res) {

  try {

    const truck =
      await truckService.create(
        req.body
      );

    res.status(201).json(truck);

  } catch (error) {

    sendError(res, error, "No se pudo crear el camión.");

  }

}

module.exports = {
  getAll,
  create
};
