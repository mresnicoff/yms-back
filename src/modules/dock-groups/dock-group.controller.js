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

module.exports = {
  getAll
};
