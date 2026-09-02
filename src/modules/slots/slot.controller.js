const slotService =
  require("./slot.service");
const { sendError } = require("../../lib/errors");

async function getAvailability(
  req,
  res
) {

  try {

    const result =
      await slotService.getAvailableSlots(
        req.query
      );

    res.status(200).json(result);

  } catch (error) {

    sendError(res, error, "No se pudo consultar la disponibilidad.");

  }

}

module.exports = {
  getAvailability
};