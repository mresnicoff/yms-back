const prisma =
  require("../../lib/prisma");

const getAll =
  async () => {

    return prisma.document.findMany({
      include: {
        documentType: true,
        driver: true,
        truck: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

  };

const getByDriver =
  async (driverId) => {

    return prisma.document.findMany({
      where: {
        driverId,
        active: true
      },
      include: {
        documentType: true
      },
      orderBy: {
        expirationDate: "asc"
      }
    });

  };

const getByTruck =
  async (truckId) => {

    return prisma.document.findMany({
      where: {
        truckId,
        active: true
      },
      include: {
        documentType: true
      },
      orderBy: {
        expirationDate: "asc"
      }
    });

  };

const create =
  async ({
    documentTypeId,
    ownerType,
    driverId,
    truckId,
    expirationDate,
    fileUrl
  }) => {

    return prisma.document.create({
      data: {
        documentTypeId,
        ownerType,
        driverId,
        truckId,
        expirationDate,
        fileUrl
      }
    });

  };
  const remove =
  async (id) => {

    return prisma.document.update({
      where: {
        id
      },
      data: {
        active: false
      }
    });

  };

module.exports = {
  getAll,
  create,
  getByDriver,
  getByTruck,
  remove
};
