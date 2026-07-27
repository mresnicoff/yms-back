const prisma =
  require("../../lib/prisma");

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

async function create({
  plate,
  vehicleTypeId
}) {

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