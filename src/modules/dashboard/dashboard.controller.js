const dashboardService = require("./dashboard.service");
const { sendError } = require("../../lib/errors");

async function getSummary(req, res) {

  try {

    const summary = await dashboardService.getSummary();

    res.status(200).json(summary);

  } catch (error) {

    sendError(res, error, "No se pudo obtener la información del dashboard.");

  }

}

module.exports = {
  getSummary
};
