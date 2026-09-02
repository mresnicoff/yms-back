const prisma =
  require("../../lib/prisma");
const { requireFields } = require("../../lib/errors");

async function getAll() {

  return prisma.driver.findMany({
    where: {
      active: true
    },
    orderBy: {
      firstName: "asc"
    }
  });

}

async function create(data) {

  requireFields(data, {
    firstName: "Nombre",
    phone: "Teléfono"
  });

  const {
    firstName,
    lastName,
    phone,
    licenseNumber
  } = data;

  return prisma.driver.create({
    data: {
      firstName,
      lastName,
      phone,
      licenseNumber
    }
  });

}

module.exports = {
  getAll,
  create
};
