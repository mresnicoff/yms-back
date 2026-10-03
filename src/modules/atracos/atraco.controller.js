const atracoService = require("./atraco.service");
const { sendError } = require("../../lib/errors");

const create = async (req, res) => {

  try {

    const atraco = await atracoService.createAtraco({
      ...req.body,
      createdById: req.user?.id
    });

    res.status(201).json(atraco);

  } catch (error) {

    sendError(res, error, "No se pudo registrar el Atraco.");

  }

};

const getByCheckIn = async (req, res) => {

  try {

    const atraco = await atracoService.getAtracoByCheckIn(
      req.params.checkInId
    );

    res.status(200).json(atraco);

  } catch (error) {

    sendError(res, error, "No se pudo obtener el Atraco.");

  }

};

module.exports = {
  create,
  getByCheckIn
};
