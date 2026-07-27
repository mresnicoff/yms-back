const supplierService =
  require("./supplier.service");

async function getAll(req, res) {

  try {

    const suppliers =
      await supplierService.getAll();

    res.status(200).json(
      suppliers
    );

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }

}

module.exports = {
  getAll
};