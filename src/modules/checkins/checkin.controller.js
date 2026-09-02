const checkInService =
  require("./checkin.service");
const { sendError } = require("../../lib/errors");

const create = async (req, res) => {

  try {

    const result =
      await checkInService.createCheckIn({
        ...req.body,
        createdById: req.user?.id
      });

    res.status(201).json(result);

  } catch (error) {

    sendError(res, error, "No se pudo registrar el Check-In.");

  }
};

module.exports = {
  create
};