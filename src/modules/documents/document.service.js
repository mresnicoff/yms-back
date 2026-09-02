const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

const getAll = async () => {
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

const getByDriver = async (driverId) => {
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

const getByTruck = async (truckId) => {
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

const create = async (data) => {
  requireFields(data, {
    documentTypeId: "Tipo de documento",
    ownerType: "Tipo de propietario",
    fileUrl: "Archivo"
  });

  const { documentTypeId, ownerType, driverId, truckId, expirationDate, fileUrl } = data;

  if (ownerType === "DRIVER" && !driverId) {
    throw new AppError("Falta indicar el conductor dueño del documento.");
  }

  if (ownerType === "TRUCK" && !truckId) {
    throw new AppError("Falta indicar el camión dueño del documento.");
  }

  const documentType = await prisma.documentType.findUnique({
    where: { id: documentTypeId }
  });

  if (!documentType) {
    throw new AppError("El tipo de documento indicado no existe.");
  }

  if (driverId) {
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) {
      throw new AppError("El conductor indicado no existe.");
    }
  }

  if (truckId) {
    const truck = await prisma.truck.findUnique({ where: { id: truckId } });
    if (!truck) {
      throw new AppError("El camión indicado no existe.");
    }
  }

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

const remove = async (id) => {
  requireFields({ id }, { id: "Documento" });

  const document = await prisma.document.findUnique({ where: { id } });

  if (!document) {
    throw new AppError("El documento indicado no existe.");
  }

  return prisma.document.update({
    where: { id },
    data: { active: false }
  });
};

module.exports = {
  getAll,
  create,
  getByDriver,
  getByTruck,
  remove
};
