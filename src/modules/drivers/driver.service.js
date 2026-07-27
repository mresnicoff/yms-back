const prisma =
  require("../../lib/prisma");

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

async function create({
  firstName,
  lastName,
  phone,
  licenseNumber
}) {

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
