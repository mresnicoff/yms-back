const driverService =
  require("./driver.service");
const { sendError } = require("../../lib/errors");

async function getAll(req, res) {

  try {

    const data =
      await driverService.getAll();

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los choferes.");

  }

}

async function create(req, res) {

  try {

    const driver =
      await driverService.create(
        req.body
      );

    res.status(201).json(driver);

  } catch (error) {

    sendError(res, error, "No se pudo crear el chofer.");

  }

}

async function update(req, res) {

  try {

    const driver =
      await driverService.update(
        req.params.id,
        req.body
      );

    res.status(200).json(driver);

  } catch (error) {

    sendError(res, error, "No se pudo actualizar el chofer.");

  }

}

async function remove(req, res) {

  try {

    await driverService.remove(
      req.params.id
    );

    res.status(204).send();

  } catch (error) {

    sendError(res, error, "No se pudo eliminar el chofer.");

  }

}

module.exports = {
  getAll,
  create,
  update,
  remove
};
