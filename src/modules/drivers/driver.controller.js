const driverService =
  require("./driver.service");

async function getAll(req, res) {

  try {

    const data =
      await driverService.getAll();

    res.status(200).json(data);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

}

async function create(req, res) {

  try {

    const driver =
      await driverService.create(
        req.body
      );

    res.status(201).json(driver);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

}

module.exports = {
  getAll,
  create
};
