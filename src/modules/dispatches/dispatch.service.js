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
      sealNumbers,
      pallets
    } = data;

    const dockOperation =
      await prisma.dockOperation.findUnique({
        where: { id: dockOperationId },
        include: {
          checkIn: {
            include: {
              appointment: {
                include: { warehouse: true }
              },
              atraco: true
            }
          }
        }
      });

    if (!dockOperation) {
      throw new AppError("La operación de dock indicada no existe.");
    }

    const { checkIn } = dockOperation;
    const { appointment } = checkIn;

    // El Atraco es un paso fijo del flujo Fátima/Infolog: si el turno vino
    // de Infolog (tiene externalTripId), no se puede hacer Check-Out sin
    // haberlo completado antes.
    if (appointment.externalTripId && !checkIn.atraco) {
      throw new AppError(
        "Este viaje requiere completar el Atraco antes del Check-Out."
      );
    }

    const checkoutMode =
      appointment.warehouse.checkoutMode;

    if (checkoutMode === "CLIENT_PALLETS") {

      if (
        pallets === undefined ||
        pallets === null ||
        Number.isNaN(Number(pallets)) ||
        Number(pallets) < 0
      ) {
        throw new AppError(
          "La cantidad de pallets no es válida."
        );
      }

      return prisma.dispatch.create({
        data: {
          dockOperationId,
          pallets: Number(pallets),
          sealNumbers: [],
          checkedOutAt: new Date()
        }
      });

    }

    requireFields(data, {
      routeSheetNumber: "Hoja de ruta"
    });

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