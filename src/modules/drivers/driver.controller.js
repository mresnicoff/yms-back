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

module.exports = {
  getAll,
  create
};
