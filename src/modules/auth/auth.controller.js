const authService =
  require("./auth.service");

const login = async (req, res) => {

  try {

    const result =
      await authService.login(req.body);

    res.status(200).json(result);

  } catch (error) {

    res.status(401).json({
      message: error.message
    });

  }
};
const me = async (req, res) => {

  res.status(200).json(req.user);

};

module.exports = {
  login,
  me
};