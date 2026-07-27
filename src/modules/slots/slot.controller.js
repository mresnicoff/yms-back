const slotService =
  require("./slot.service");

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

    res.status(400).json({
      message: error.message
    });

  }

}

module.exports = {
  getAvailability
};