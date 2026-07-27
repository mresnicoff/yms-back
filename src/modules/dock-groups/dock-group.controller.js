const dockGroupService =
  require("./dock-group.service");

async function getAll(req, res) {

  try {

    const data =
      await dockGroupService.getAll();

    res.status(200).json(data);

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

}

module.exports = {
  getAll
};