const dockOperationService =
  require("./dock-operation.service");
const { sendError } = require("../../lib/errors");

const getActive =
  async (req, res) => {

    try {

      const data =
        await dockOperationService
          .getActiveOperations();

      res.status(200).json(data);

    } catch (error) {

      sendError(res, error, "No se pudieron obtener las operaciones activas.");

    }

  };

const assign = async (req, res) => {
  try {

    const result =
      await dockOperationService.assignDock({
        ...req.body,
        assignedById: req.user?.id
      });

    res.status(200).json(result);

  } catch (error) {

    sendError(res, error, "No se pudo asignar el dock.");

  }
};
const getQueue = async (req, res) => {

  try {

    const queue =
      await dockOperationService.getQueue(
        req.params.dockGroupId
      );

    res.status(200).json(queue);

  } catch (error) {

    sendError(res, error, "No se pudo obtener la cola.");

  }
};
const finish = async (req, res) => {

  try {

    const result =
      await dockOperationService
        .finishDockOperation(req.body);

    res.status(200).json(result);

  } catch (error) {

    sendError(res, error, "No se pudo finalizar la operación.");

  }

};

const getDocksByGroup =
  async (req, res) => {

    try {

      const data =
        await dockOperationService
          .getDocksByGroup(
            req.params.dockGroupId
          );

      res.status(200).json(data);

    } catch (error) {

      sendError(res, error, "No se pudieron obtener los docks.");

    }

  };
const manualAssign =
  async (req, res) => {

    try {

      const result =
        await dockOperationService
          .manualAssignDock({
            ...req.body,
            assignedById: req.user?.id
          });

      res.status(200).json(result);

    } catch (error) {

      sendError(res, error, "No se pudo asignar el dock manualmente.");

    }

  };
module.exports = {
  assign,
  getQueue,
  finish,
  getActive,
  getDocksByGroup,
  manualAssign
};
