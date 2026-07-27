const prisma =
  require("../../lib/prisma");

async function getAll() {

  return prisma.dockGroup.findMany({
    include: {
      warehouse: true
    },
    orderBy: {
      name: "asc"
    }
  });

}

module.exports = {
  getAll
};