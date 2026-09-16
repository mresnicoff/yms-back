const userService = require("./user.service");
const { sendError } = require("../../lib/errors");

const getAll = async (req, res) => {

  try {

    const users = await userService.getAll();

    res.status(200).json(users);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los usuarios.");

  }

};

const getRoles = async (req, res) => {

  try {

    const roles = await userService.getRoles();

    res.status(200).json(roles);

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los roles.");

  }

};

const create = async (req, res) => {

  try {

    const user = await userService.create(req.body);

    res.status(201).json(user);

  } catch (error) {

    sendError(res, error, "No se pudo crear el usuario.");

  }

};

const update = async (req, res) => {

  try {

    const user = await userService.update(
      req.params.id,
      req.body,
      req.user?.id
    );

    res.status(200).json(user);

  } catch (error) {

    sendError(res, error, "No se pudo actualizar el usuario.");

  }

};

const resetPassword = async (req, res) => {

  try {

    const result = await userService.resetPassword(
      req.params.id,
      req.body
    );

    res.status(200).json(result);

  } catch (error) {

    sendError(res, error, "No se pudo resetear la contraseña.");

  }

};

module.exports = {
  getAll,
  getRoles,
  create,
  update,
  resetPassword
};
