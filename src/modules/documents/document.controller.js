const documentService = require("./document.service");
const { sendError } = require("../../lib/errors");

const getAll = async (req, res) => {
  try {
    const data = await documentService.getAll();
    res.status(200).json(data);
  } catch (error) {
    sendError(res, error, "No se pudieron obtener los documentos.");
  }
};

const getByDriver = async (req, res) => {
  try {
    const data = await documentService.getByDriver(req.params.driverId);
    res.status(200).json(data);
  } catch (error) {
    sendError(res, error, "No se pudieron obtener los documentos del conductor.");
  }
};

const getByTruck = async (req, res) => {
  try {
    const data = await documentService.getByTruck(req.params.truckId);
    res.status(200).json(data);
  } catch (error) {
    sendError(res, error, "No se pudieron obtener los documentos del camión.");
  }
};

const create = async (req, res) => {
  try {
    const data = await documentService.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    sendError(res, error, "No se pudo registrar el documento.");
  }
};

const remove = async (req, res) => {
  try {
    await documentService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    sendError(res, error, "No se pudo eliminar el documento.");
  }
};

module.exports = {
  getAll,
  create,
  getByDriver,
  getByTruck,
  remove
};
