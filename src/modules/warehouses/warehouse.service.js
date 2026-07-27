const prisma =
  require("../../lib/prisma");

async function getAll() {

  return prisma.warehouse.findMany({
    orderBy: {
      name: "asc"
    }
  });

}

module.exports = {
  getAll
};