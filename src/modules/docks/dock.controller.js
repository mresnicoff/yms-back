const dockService = require("./dock.service");
const { sendError } = require("../../lib/errors");

async function listByGroup(req, res) {

  try {

    const docks = await dockService.listByGroup(req.query.groupId);

    res.status(200).json(docks);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los docks.");

  }

}

async function create(req, res) {

  try {

    const dock = await dockService.create(req.body);

    res.status(201).json(dock);

  } catch (error) {

    sendError(res, error, "No se pudo crear el dock.");

  }

}

async function createBulk(req, res) {

  try {

    const docks = await dockService.createBulk(req.body);

    res.status(201).json(docks);

  } catch (error) {

    sendError(res, error, "No se pudieron crear los docks.");

  }

}

async function update(req, res) {

  try {

    const dock = await dockService.update(req.params.id, req.body);

    res.status(200).json(dock);

  } catch (error) {

    sendError(res, error, "No se pudo actualizar el dock.");

  }

}

module.exports = {
  listByGroup,
  create,
  createBulk,
  update
};
