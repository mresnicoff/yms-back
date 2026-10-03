const infologService = require("./infolog.service");
const { sendError } = require("../../lib/errors");

const sync = async (req, res) => {

  try {

    const summary = await infologService.syncInfologTrips(req.body);

    res.status(200).json(summary);

  } catch (error) {

    sendError(res, error, "No se pudieron sincronizar los viajes de Infolog.");

  }

};

module.exports = {
  sync
};
