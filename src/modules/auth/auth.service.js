const prisma = require("../../lib/prisma");
const jwt = require("jsonwebtoken");

const login = async ({
  email,
  password
}) => {

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
    throw new Error("Invalid credentials");
  }

  if (user.passwordHash !== password) {
    throw new Error("Invalid credentials");
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