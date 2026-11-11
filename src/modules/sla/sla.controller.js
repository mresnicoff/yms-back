const slaService = require("./sla.service");
const { sendError } = require("../../lib/errors");

async function getReport(req, res) {

  try {

    const { from, to, warehouseId, supplierId } = req.query;

    const report = await slaService.getReport({
      from,
      to,
      warehouseId,
      supplierId
    });

    res.status(200).json(report);

  } catch (error) {

    sendError(res, error, "No se pudo generar el reporte de tiempos.");

  }

}

module.exports = { getReport };
