const prisma =
  require("../../lib/prisma");

const getAll =
  async () => {

    return prisma.requiredDocument.findMany({
      where: {
        active: true
      },
      include: {
        documentType: true
      },
      orderBy: {
        operationType: "asc"
      }
    });

  };
  const update =
  async (
    id,
    {
      documentTypeId,
      operationType,
      ownerType
    }
  ) => {

    return prisma.requiredDocument.update({
      where: {
        id
      },
      data: {
        documentTypeId,
        operationType,
        ownerType
      }
    });

  };

const remove =
  async (id) => {

    return prisma.requiredDocument.update({
      where: {
        id
      },
      data: {
        active: false
      }
    });

  };

const create =
  async ({
    documentTypeId,
    operationType,
    ownerType
  }) => {

    return prisma.requiredDocument.create({
      data: {
        documentTypeId,
        operationType,
        ownerType
      }
    });

  };

module.exports = {
  getAll,
  create,
  update,
  remove
};
