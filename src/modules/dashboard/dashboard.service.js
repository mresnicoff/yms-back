const prisma = require("../../lib/prisma");
const {
  getBuenosAiresDateParts,
  buenosAiresDateTime
} = require("../../lib/timezone");

const pad = (n) => String(n).padStart(2, "0");

const formatDateStr = (year, month, day) =>
  `${year}-${pad(month)}-${pad(day)}`;

/**
 * Calcula el rango de la semana en curso (lunes a domingo, hora de Buenos
 * Aires), devolviendo tanto los instantes UTC para filtrar en la base de
 * datos como las fechas de pared para mostrar en la UI.
 */
function getCurrentWeekRange() {

  const now = new Date();

  const { year, month, day, weekday } = getBuenosAiresDateParts(now);

  // weekday: 0 = domingo ... 6 = sábado. Queremos que la semana arranque
  // el lunes, así que calculamos cuántos días pasaron desde el último lunes.
  const daysSinceMonday = (weekday + 6) % 7;

  // Usamos mediodía UTC como ancla para hacer aritmética de días sin
  // riesgo de saltar de fecha por redondeos (mismo criterio que
  // getWeekdayFromDateString).
  const todayAnchor = new Date(Date.UTC(year, month - 1, day, 12));

  const mondayAnchor = new Date(
    todayAnchor.getTime() - daysSinceMonday * 24 * 60 * 60 * 1000
  );

  const nextMondayAnchor = new Date(
    mondayAnchor.getTime() + 7 * 24 * 60 * 60 * 1000
  );

  const sundayAnchor = new Date(
    nextMondayAnchor.getTime() - 24 * 60 * 60 * 1000
  );

  const mondayStr = formatDateStr(
    mondayAnchor.getUTCFullYear(),
    mondayAnchor.getUTCMonth() + 1,
    mondayAnchor.getUTCDate()
  );

  const nextMondayStr = formatDateStr(
    nextMondayAnchor.getUTCFullYear(),
    nextMondayAnchor.getUTCMonth() + 1,
    nextMondayAnchor.getUTCDate()
  );

  const sundayStr = formatDateStr(
    sundayAnchor.getUTCFullYear(),
    sundayAnchor.getUTCMonth() + 1,
    sundayAnchor.getUTCDate()
  );

  return {
    startDate: mondayStr,
    endDate: sundayStr,
    // Instante UTC real del lunes 00:00 hora Buenos Aires (inclusive).
    start: buenosAiresDateTime(mondayStr, "00:00"),
    // Instante UTC real del lunes siguiente 00:00 hora Buenos Aires
    // (exclusive), o sea el techo de la semana en curso.
    end: buenosAiresDateTime(nextMondayStr, "00:00")
  };

}

async function getSummary() {

  const week = getCurrentWeekRange();

  const activeAppointmentsCount = await prisma.appointment.count({
    where: {
      startTime: {
        gte: week.start,
        lt: week.end
      },
      status: {
        not: "CANCELLED"
      }
    }
  });

  const docksRaw = await prisma.dock.findMany({
    include: {
      group: {
        include: {
          warehouse: true
        }
      },
      operations: {
        where: {
          status: "ASSIGNED"
        },
        orderBy: {
          startedAt: "desc"
        },
        take: 1
      }
    }
  });

  const now = Date.now();

  const docks = docksRaw
    .map((dock) => {

      const activeOperation = dock.operations[0] || null;

      const occupiedSince = activeOperation
        ? activeOperation.startedAt
        : null;

      const occupiedMinutes = activeOperation
        ? Math.max(
            0,
            Math.floor(
              (now - new Date(activeOperation.startedAt).getTime()) / 60000
            )
          )
        : null;

      return {
        id: dock.id,
        code: dock.code,
        active: dock.active,
        status: dock.status,
        isOccupied: dock.status === "OCCUPIED",
        occupiedSince,
        occupiedMinutes,
        dockGroupId: dock.group.id,
        dockGroupName: dock.group.name,
        warehouseId: dock.group.warehouse.id,
        warehouseName: dock.group.warehouse.name
      };

    })
    .sort((a, b) => {

      if (a.warehouseName !== b.warehouseName) {
        return a.warehouseName.localeCompare(b.warehouseName);
      }

      if (a.dockGroupName !== b.dockGroupName) {
        return a.dockGroupName.localeCompare(b.dockGroupName);
      }

      return a.code.localeCompare(b.code);

    });

  return {
    week: {
      startDate: week.startDate,
      endDate: week.endDate
    },
    activeAppointmentsCount,
    docks
  };

}

module.exports = {
  getSummary
};
