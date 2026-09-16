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

async function getAllAdmin(req, res) {

  try {

    const warehouses =
      await warehouseService.getAllAdmin();

    res.status(200).json(warehouses);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los depósitos.");

  }

}

async function getById(req, res) {

  try {

    const warehouse =
      await warehouseService.getById(req.params.id);

    res.status(200).json(warehouse);

  } catch (error) {

    sendError(res, error, "No se pudo obtener el depósito.");

  }

}

async function create(req, res) {

  try {

    const warehouse =
      await warehouseService.create(req.body);

    res.status(201).json(warehouse);

  } catch (error) {

    sendError(res, error, "No se pudo crear el depósito.");

  }

}

async function update(req, res) {

  try {

    const warehouse =
      await warehouseService.update(req.params.id, req.body);

    res.status(200).json(warehouse);

  } catch (error) {

    sendError(res, error, "No se pudo actualizar el depósito.");

  }

}

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  update
};
