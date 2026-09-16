const dockGroupService =
  require("./dock-group.service");
const { sendError } = require("../../lib/errors");

async function getAll(req, res) {

  try {

    const data =
      await dockGroupService.getAll();

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los dock groups.");

  }

}

async function getAllAdmin(req, res) {

  try {

    const data =
      await dockGroupService.getAllAdmin(req.query.warehouseId);

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los dock groups.");

  }

}

async function getById(req, res) {

  try {

    const data =
      await dockGroupService.getById(req.params.id);

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudo obtener el dock group.");

  }

}

async function create(req, res) {

  try {

    const data =
      await dockGroupService.create(req.body);

    res.status(201).json(data);

  } catch (error) {

    sendError(res, error, "No se pudo crear el dock group.");

  }

}

async function update(req, res) {

  try {

    const data =
      await dockGroupService.update(req.params.id, req.body);

    res.status(200).json(data);

  } catch (error) {

    sendError(res, error, "No se pudo actualizar el dock group.");

  }

}

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  update
};
