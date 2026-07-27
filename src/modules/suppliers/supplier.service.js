const prisma =
  require("../../lib/prisma");

async function getAll() {

  return prisma.supplier.findMany({
    orderBy: {
      name: "asc"
    }
  });

}

module.exports = {
  getAll
};