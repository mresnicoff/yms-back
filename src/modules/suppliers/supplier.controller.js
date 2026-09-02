const supplierService =
  require("./supplier.service");
const { sendError } = require("../../lib/errors");

async function getAll(req, res) {

  try {

    const suppliers =
      await supplierService.getAll();

    res.status(200).json(
      suppliers
    );

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los proveedores.");

  }

}

module.exports = {
  getAll
};
