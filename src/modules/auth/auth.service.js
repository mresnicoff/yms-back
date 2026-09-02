const prisma = require("../../lib/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { AppError, requireFields } = require("../../lib/errors");

const login = async (data) => {

  requireFields(data, {
    email: "Email",
    password: "Contraseña"
  });

  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: {
      email
    },
    include: {
      role: true,
      supplier: true
    }
  });

  if (!user) {
    throw new AppError("Email o contraseña incorrectos.", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new AppError("Email o contraseña incorrectos.", 401);
  }

  if (user.status && user.status !== "ACTIVE") {
    throw new AppError("Este usuario no está activo.", 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role.code,
      supplierId: user.supplierId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  );

  return {
    token
  };
};

module.exports = {
  login
};