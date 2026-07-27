const prisma =
  require("../../lib/prisma");

async function getAll() {

  return prisma.vehicleType.findMany({
    orderBy: {
      name: "asc"
    }
  });

}

module.exports = {
  getAll
};