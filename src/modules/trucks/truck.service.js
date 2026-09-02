const prisma =
  require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

async function getAll() {

  return prisma.truck.findMany({
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

module.exports = {
  getAll,
  create
};