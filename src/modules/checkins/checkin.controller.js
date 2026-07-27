const checkInService =
  require("./checkin.service");

const create = async (req, res) => {

  try {

    const result =
      await checkInService.createCheckIn(
        req.body
      );

    res.status(201).json(result);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};

module.exports = {
  create
};