const prisma = require("../../lib/prisma");
const { AppError } = require("../../lib/errors");
const { buenosAiresDateTime } = require("../../lib/timezone");

const minutesBetween = (a, b) => {
  if (!a || !b) return null;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
};

const avg = (values) => {
  const v = values.filter((x) => x !== null && x !== undefined);
  if (v.length === 0) return null;
  return Math.round(v.reduce((s, x) => s + x, 0) / v.length);
};

// Percentil 90 por método de rango más cercano.
const p90 = (values) => {
  const v = values
    .filter((x) => x !== null && x !== undefined)
    .sort((a, b) => a - b);
  if (v.length === 0) return null;
  return v[Math.min(v.length - 1, Math.ceil(0.9 * v.length) - 1)];
};

/**
 * Tiempos por etapa de cada viaje.
 *
 * Etapas (todas en minutos):
 *  - lateMinutes: llegada (Check-In) menos hora del turno. Positivo = tarde.
 *  - yardWait:    llegada -> asignación de dock (espera en playa / cola).
 *  - toDock:      asignación de dock -> Atraco (el camión estaciona).
 *  - dockTime:    Atraco -> liberación del dock (operación de carga/descarga).
 *  - total:       llegada -> liberación del dock (ciclo completo en planta).
 */
async function getReport({ from, to, warehouseId, supplierId }) {

  if (!from || !to) {
    throw new AppError("Indicá el período (desde y hasta).");
  }

  const start = buenosAiresDateTime(from, "00:00");
  const endDay = new Date(buenosAiresDateTime(to, "00:00").getTime() + 24 * 3600 * 1000);

  if (Number.isNaN(start.getTime()) || Number.isNaN(endDay.getTime())) {
    throw new AppError("El período no es válido.");
  }

  const where = {
    startTime: { gte: start, lt: endDay },
    status: { notIn: ["CANCELLED"] },
    checkIn: { isNot: null }
  };

  if (warehouseId) where.warehouseId = warehouseId;
  if (supplierId) where.supplierId = supplierId;

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      supplier: true,
      warehouse: true,
      checkIn: {
        include: {
          truck: true,
          atraco: true,
          dockOperation: { include: { dock: true } }
        }
      }
    },
    orderBy: { startTime: "asc" }
  });

  const rows = appointments.map((a) => {

    const ci = a.checkIn;
    const op = ci.dockOperation;
    const atracoTime = ci.atraco ? ci.atraco.horaAtraco : null;

    return {
      appointmentId: a.id,
      supplier: a.supplier.name,
      warehouse: a.warehouse.name,
      plate: ci.truck?.plate || null,
      operationType: a.operationType,
      dock: op?.dock?.code || null,
      status: a.status,
      scheduledStart: a.startTime,
      arrivalTime: ci.arrivalTime,
      assignedAt: op ? op.startedAt : null,
      dockedAt: atracoTime,
      releasedAt: op ? op.finishedAt : null,
      lateMinutes: minutesBetween(a.startTime, ci.arrivalTime),
      yardWait: minutesBetween(ci.arrivalTime, op?.startedAt),
      toDock: minutesBetween(op?.startedAt, atracoTime),
      dockTime: minutesBetween(atracoTime, op?.finishedAt),
      total: minutesBetween(ci.arrivalTime, op?.finishedAt)
    };

  });

  const stats = (key) => ({
    avg: avg(rows.map((r) => r[key])),
    p90: p90(rows.map((r) => r[key])),
    count: rows.filter((r) => r[key] !== null).length
  });

  return {
    from,
    to,
    count: rows.length,
    summary: {
      yardWait: stats("yardWait"),
      toDock: stats("toDock"),
      dockTime: stats("dockTime"),
      total: stats("total"),
      late: stats("lateMinutes")
    },
    rows
  };

}

module.exports = { getReport };
