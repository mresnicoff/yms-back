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

async function update(req, res) {

  try {

    const truck =
      await truckService.update(
        req.params.id,
        req.body
      );

    res.status(200).json(truck);

  } catch (error) {

    sendError(res, error, "No se pudo actualizar el camión.");

  }

}

async function remove(req, res) {

  try {

    await truckService.remove(
      req.params.id
    );

    res.status(204).send();

  } catch (error) {

    sendError(res, error, "No se pudo eliminar el camión.");

  }

}

module.exports = {
  getAll,
  create,
  update,
  remove
};
