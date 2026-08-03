const dispatchService =
  require("./dispatch.service");

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

      res.status(400).json({
        message:
          error.message
      });

    }

  };

module.exports = {
  create
};