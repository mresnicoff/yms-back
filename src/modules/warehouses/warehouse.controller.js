const warehouseService = require("./warehouse.service");
const { sendError } = require("../../lib/errors");

async function getAll(req, res) {

  try {

    const warehouses =
      await warehouseService.getAll();

    res.status(200).json(
      warehouses
    );

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los depósitos.");

  }

}

module.exports = {
  getAll
};
