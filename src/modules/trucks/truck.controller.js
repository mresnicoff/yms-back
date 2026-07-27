const truckService =
  require("./truck.service");

async function getAll(req, res) {

  try {

    const data =
      await truckService.getAll();

    res.status(200).json(data);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

}

async function create(req, res) {

  try {

    const truck =
      await truckService.create(
        req.body
      );

    res.status(201).json(truck);

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