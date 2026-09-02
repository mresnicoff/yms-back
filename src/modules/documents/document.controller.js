const documentService =
  require("./document.service");

const getAll =
  async (req, res) => {

    try {

      const data =
        await documentService
          .getAll();

      res.status(200).json(data);

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };

  const getByDriver =
  async (req, res) => {

    try {

      const data =
        await documentService
          .getByDriver(
            req.params.driverId
          );

      res.status(200).json(data);

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };

const getByTruck =
  async (req, res) => {

    try {

      const data =
        await documentService
          .getByTruck(
            req.params.truckId
          );

      res.status(200).json(data);

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };
const create =
  async (req, res) => {

    try {
console.log(req.body)
      const data =
        await documentService
          .create(
            req.body
          );

      res.status(201).json(data);

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };
  const remove =
  async (req, res) => {

    try {

      await documentService.remove(
        req.params.id
      );

      res.status(204).send();

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };

module.exports = {
  getAll,
  create,
  getByDriver,
  getByTruck,
  remove
};