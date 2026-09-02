const prisma =
  require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

async function getAll() {

  return prisma.truck.findMany({
    where: {
      active: true
    },
    include: {
      vehicleType: true
    },
    orderBy: {
      plate: "asc"
    }
  });

}

async function create(data) {

  requireFields(data, {
    plate: "Patente",
    vehicleTypeId: "Tipo de vehículo"
  });

  const { plate, vehicleTypeId } = data;

  const vehicleType = await prisma.vehicleType.findUnique({
    where: { id: vehicleTypeId }
  });

  if (!vehicleType) {
    throw new AppError("El tipo de vehículo indicado no existe.");
  }

  const existing = await prisma.truck.findUnique({
    where: { plate }
  });

  if (existing) {
    throw new AppError(`Ya existe un camión con la patente ${plate}.`);
  }

  return prisma.truck.create({
    data: {
      plate,
      vehicleTypeId
    },
    include: {
      vehicleType: true
    }
  });

}

async function update(id, data) {

  requireFields(data, {
    plate: "Patente",
    vehicleTypeId: "Tipo de vehículo"
  });

  const { plate, vehicleTypeId } = data;

  const existing = await prisma.truck.findUnique({
    where: { id }
  });

  if (!existing || !existing.active) {
    throw new AppError("El camión indicado no existe.");
  }

  const vehicleType = await prisma.vehicleType.findUnique({
    where: { id: vehicleTypeId }
  });

  if (!vehicleType) {
    throw new AppError("El tipo de vehículo indicado no existe.");
  }

  const plateOwner = await prisma.truck.findUnique({
    where: { plate }
  });

  if (plateOwner && plateOwner.id !== id) {
    throw new AppError(`Ya existe un camión con la patente ${plate}.`);
  }

  return prisma.truck.update({
    where: { id },
    data: {
      plate,
      vehicleTypeId
    },
    include: {
      vehicleType: true
    }
  });

}

async function remove(id) {

  const existing = await prisma.truck.findUnique({
    where: { id }
  });

  if (!existing || !existing.active) {
    throw new AppError("El camión indicado no existe.");
  }

  return prisma.truck.update({
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