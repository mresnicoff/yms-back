const service =
  require("./document-type.service");

const getAll =
  async (req, res) => {

    try {

      const data =
        await service.getAll();

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

      const data =
        await service.create(
          req.body
        );

      res.status(201).json(data);

    } catch (error) {

      res.status(400).json({
        message: error.message
      });

    }

  };
  const update =
  async (req, res) => {

    try {

      const data =
        await service.update(
          req.params.id,
          req.body
        );

      res.status(200).json(data);

    } catch (error) {

      res.status(400).json({
        message:
          error.message
      });

    }

  };

const remove =
  async (req, res) => {

    try {

      await service.remove(
        req.params.id
      );

      res.status(204).send();

    } catch (error) {

      res.status(400).json({
        message:
          error.message
      });

    }

  };

module.exports = {
  getAll,
  create,
  update,
  remove
};
