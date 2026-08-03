const prisma =
  require("../../lib/prisma");

const createDispatch =
  async ({
    dockOperationId,
    routeSheetNumber,
    sealNumbers
  }) => {

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