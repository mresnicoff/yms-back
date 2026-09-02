const authService =
  require("./auth.service");
const { sendError } = require("../../lib/errors");

const login = async (req, res) => {

  try {

    const result =
      await authService.login(req.body);

    res.status(200).json(result);

  } catch (error) {

    sendError(res, error, "No se pudo iniciar sesión. Intentá nuevamente.");

  }
};
const me = async (req, res) => {

  res.status(200).json(req.user);

};

module.exports = {
  login,
  me
};