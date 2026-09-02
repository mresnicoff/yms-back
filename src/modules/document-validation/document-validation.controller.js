const service =
  require(
    "./document-validation.service"
  );

const validateCheckIn =
  async (req, res) => {

    try {

      const result =
        await service.validateCheckIn(
          req.body
        );

      res.status(200).json(
        result
      );

    } catch (error) {

      res.status(400).json({
        message:
          error.message
      });

    }

  };

module.exports = {
  validateCheckIn
};
``