const dispatchService =
  require("./dispatch.service");
const { sendError } = require("../../lib/errors");

const create =
  async (req, res) => {

    try {

      const dispatch =
        await dispatchService
          .createDispatch(
            req.body
          );

      res.status(201).json(
        dispatch
      );

    } catch (error) {

      sendError(res, error, "No se pudo registrar el despacho.");

    }

  };

module.exports = {
  create
};