const prisma =
  require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

const createDispatch =
  async (data) => {

    requireFields(data, {
      dockOperationId: "Operación de dock"
    });

    const {
      dockOperationId,
      routeSheetNumber,
      sealNumbers
    } = data;

    const dockOperation =
      await prisma.dockOperation.findUnique({
        where: { id: dockOperationId }
      });

    if (!dockOperation) {
      throw new AppError("La operación de dock indicada no existe.");
    }

    return prisma.dispatch.create({
      data: {
        dockOperationId,
        routeSheetNumber,
        sealNumbers,
        checkedOutAt:
          new Date()
      }
    });

  };

module.exports = {
  createDispatch
};