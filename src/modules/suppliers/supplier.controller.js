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

async function create(req, res) {

  try {

    const supplier =
      await supplierService.create(req.body);

    res.status(201).json(
      supplier
    );

  } catch (error) {

    sendError(res, error, "No se pudo crear el proveedor.");

  }

}

module.exports = {
  getAll,
  create
};
