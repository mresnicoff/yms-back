const jwt = require("jsonwebtoken");

const authMiddleware = (
  req,
  res,
  next
) => {

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token required"
    });
  }

  const token =
    authHeader.replace("Bearer ", "");

  try {

    req.user = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    next();

  } catch {

    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

module.exports = authMiddleware;