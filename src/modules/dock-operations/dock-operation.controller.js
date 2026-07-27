const dockOperationService =
  require("./dock-operation.service");

  const getActive =
  async (req, res) => {

    try {

      const data =
        await dockOperationService
          .getActiveOperations();

      res.status(200).json(data);

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };

const assign = async (req, res) => {
  try {

    const result =
      await dockOperationService.assignDock(
        req.body
      );

    res.status(200).json(result);

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message: error.message
    });

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

    console.error(error);

    res.status(400).json({
      message: error.message
    });

  }
};  
const finish = async (req, res) => {

  try {

    const result =
      await dockOperationService
        .finishDockOperation(req.body);

    res.status(200).json(result);

  } catch (error) {

    console.error(error);

    res.status(400).json({
      message: error.message
    });

  }
};
module.exports = {
  assign,
  getQueue,
  finish,
  getActive
};