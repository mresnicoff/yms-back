const prisma =
  require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

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

async function update(id, data) {

  requireFields(data, {
    firstName: "Nombre",
    phone: "Teléfono"
  });

  const existing = await prisma.driver.findUnique({
    where: { id }
  });

  if (!existing || !existing.active) {
    throw new AppError("El chofer indicado no existe.");
  }

  const {
    firstName,
    lastName,
    phone,
    licenseNumber
  } = data;

  return prisma.driver.update({
    where: { id },
    data: {
      firstName,
      lastName,
      phone,
      licenseNumber
    }
  });

}

async function remove(id) {

  const existing = await prisma.driver.findUnique({
    where: { id }
  });

  if (!existing || !existing.active) {
    throw new AppError("El chofer indicado no existe.");
  }

  return prisma.driver.update({
    where: { id },
    data: {
      active: false
    }
  });

}

module.exports = {
  getAll,
  create,
  update,
  remove
};
