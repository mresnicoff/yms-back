const vehicleTypeService =
  require("./vehicle-type.service");
const { sendError } = require("../../lib/errors");

async function getAll(req, res) {

  try {

    const data =
      await vehicleTypeService.getAll();

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los tipos de vehículo.");

  }

}

module.exports = {
  getAll
};
