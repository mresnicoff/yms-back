const prisma = require("../../lib/prisma");
const { AppError, requireFields } = require("../../lib/errors");

/**
 * Atraco: actividad del flujo Fátima/Infolog que siempre va entre el
 * Check-In y el Check-Out (no es opcional, no depende del depósito). Se
 * dispara con un botón manual, nunca automáticamente.
 */
const createAtraco = async (data) => {

  requireFields(data, {
    checkInId: "Check-In",
    llavesOk: "Llaves OK",
    clienteFinal: "Cliente final",
    receptor: "Receptor",
    auditor: "Auditor",
    cargador: "Cargador"
  });

  const {
    checkInId,
    cunasColocadas,
    llavesOk,
    clienteFinal,
    receptor,
    auditor,
    cargador,
    createdById
  } = data;

  if (
    cunasColocadas === undefined ||
    cunasColocadas === null ||
    Number.isNaN(Number(cunasColocadas)) ||
    Number(cunasColocadas) < 0
  ) {
    throw new AppError("La cantidad de cuñas colocadas no es válida.");
  }

  return prisma.$transaction(async (tx) => {

    const checkIn = await tx.checkIn.findUnique({
      where: { id: checkInId },
      include: { atraco: true }
    });

    if (!checkIn) {
      throw new AppError("El Check-In indicado no existe.");
    }

    if (checkIn.atraco) {
      throw new AppError("Este Check-In ya tiene un Atraco registrado.");
    }

    return tx.atraco.create({
      data: {
        checkInId,
        cunasColocadas: Number(cunasColocadas),
        llavesOk: Boolean(llavesOk),
        clienteFinal,
        receptor,
        auditor,
        cargador,
        createdById
      }
    });

  });

};

const getAtracoByCheckIn = async (checkInId) => {

  const atraco = await prisma.atraco.findUnique({
    where: { checkInId }
  });

  return atraco;

};

module.exports = {
  createAtraco,
  getAtracoByCheckIn
};
