const prisma = require("../../lib/prisma");
const warehouseService = require("./warehouse.service");

async function getAll(req, res) {

  try {

    const warehouses =
      await warehouseService.getAll();

    res.status(200).json(
      warehouses
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