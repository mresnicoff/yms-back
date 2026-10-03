const prisma = require("../../lib/prisma");
const notificationService =
  require("../../services/notification.service");
const { AppError, requireFields } = require("../../lib/errors");

const getActiveOperations =
  async () => {

    return prisma.dockOperation.findMany({
      where: {
        status: "ASSIGNED"
      },
      include: {
        dock: true,
        checkIn: {
          include: {
            appointment: {
              include: {
                supplier: true,
                warehouse: true
              }
            },
            atraco: true
          }
        }
      },
      orderBy: {
        startedAt: "asc"
      }
    });

  };
  const getDocksByGroup =
  async (dockGroupId) => {

    return prisma.dock.findMany({
      where: {
        groupId: dockGroupId,
        active: true,
        status: "FREE"
      },
      orderBy: {
        code: "asc"
      }
    });

  };

const assignDock = async (data) => {

  requireFields(data, {
    checkInId: "Check-In"
  });

  const { checkInId, assignedById } = data;

  return prisma.$transaction(async (tx) => {

    const checkIn =
      await tx.checkIn.findUnique({
        where: {
          id: checkInId
        },
        include: {
          appointment: true,
          driver: true
        }
      });

    if (!checkIn) {
      throw new AppError(
        "El Check-In indicado no existe."
      );
    }

    const appointment =
      checkIn.appointment;

    if (
      appointment.status !== "WAITING_DOCK" &&
      appointment.status !== "CHECKED_IN"
    ) {
      throw new AppError(
        `El turno ya no está en condiciones de asignarse a un dock (estado: ${appointment.status}).`
      );
    }

    // Los docks ya no están atados a un único tipo de operación: un
    // grupo puede compartir el mismo pool de docks entre carga y
    // descarga, así que cualquier dock libre del grupo sirve.
    const dock =
      await tx.dock.findFirst({
        where: {
          groupId:
            appointment.dockGroupId,
          status: "FREE",
          active: true
        },
        orderBy: {
          code: "asc"
        }
      });

    if (!dock) {
      return {
        assigned: false,
        message:
          "No dock available"
      };
    }

    const dockOperation =
      await tx.dockOperation.create({
        data: {
          dockId: dock.id,
          checkInId: checkIn.id,
          assignedById,
          startedAt: new Date(),
          status: "ASSIGNED"
        }
      });

    await tx.dock.update({
      where: {
        id: dock.id
      },
      data: {
        status: "OCCUPIED"
      }
    });

    await tx.appointment.update({
      where: {
        id: appointment.id
      },
      data: {
        status: "IN_OPERATION"
      }
    });

    if (
      checkIn.driver &&
      checkIn.driver.phone
    ) {

      try {

        await notificationService
          .sendDockAssignment({
            phone:
              checkIn.driver.phone,

            driverName:
              `${checkIn.driver.firstName} ${checkIn.driver.lastName ?? ""}`.trim(),

            dockCode:
              dock.code
          });

      } catch (error) {

        console.error(
          "Error enviando WhatsApp",
          error.response?.data ||
          error.message
        );

      }

    }

    return {
      assigned: true,
      dockCode: dock.code,
      driverName:
        checkIn.driver
          ? `${checkIn.driver.firstName} ${checkIn.driver.lastName ?? ""}`.trim()
          : null,
      driverPhone:
        checkIn.driver?.phone,
      dockOperation
    };

  });

};

const getQueue = async (
  dockGroupId
) => {

  const queue =
    await prisma.appointment.findMany({
      where: {
        dockGroupId,
        status: "WAITING_DOCK"
      },
      include: {
        supplier: true,
        checkIn: true
      }
    });

  queue.sort(
    (a, b) =>
      new Date(
        a.checkIn.arrivalTime
      ) -
      new Date(
        b.checkIn.arrivalTime
      )
  );

return queue.map(
  (appointment, index) => ({
    position: index + 1,
    appointmentId:
      appointment.id,
    checkInId:
      appointment.checkIn.id,
    supplier:
      appointment.supplier.name,
    operationType:
      appointment.operationType,
    arrivalTime:
      appointment.checkIn
        .arrivalTime
  })
);

};

const finishDockOperation =
  async (data) => {

    requireFields(data, {
      dockOperationId: "Operación de dock"
    });

    const { dockOperationId } = data;

    return prisma.$transaction(
      async (tx) => {

        const dockOperation =
          await tx.dockOperation
            .findUnique({
              where: {
                id:
                  dockOperationId
              },
              include: {
                dock: true,
                checkIn: {
                  include: {
                    appointment: {
                      include: {
                        dockGroup: true
                      }
                    },
                    atraco: true
                  }
                }
              }
            });

        if (!dockOperation) {
          throw new AppError(
            "La operación de dock indicada no existe."
          );
        }

        if (
          dockOperation.status ===
          "FINISHED"
        ) {
          throw new AppError(
            "Esta operación de dock ya fue finalizada."
          );
        }

        // El Atraco es un paso fijo entre Check-In y Check-Out para todos
        // los viajes (carga o descarga, cualquier depósito): no se puede
        // finalizar la operación sin haberlo completado antes.
        if (!dockOperation.checkIn.atraco) {
          throw new AppError(
            "Este viaje requiere completar el Atraco antes del Check-Out."
          );
        }

        const dock =
          dockOperation.dock;

        const completedAppointment =
          dockOperation.checkIn
            .appointment;

        await tx.dockOperation
          .update({
            where: {
              id:
                dockOperationId
            },
            data: {
              status:
                "FINISHED",
              finishedAt:
                new Date()
            }
          });

        await tx.dock.update({
          where: {
            id: dock.id
          },
          data: {
            status: "FREE"
          }
        });

        await tx.appointment
          .update({
            where: {
              id:
                completedAppointment.id
            },
            data: {
              status:
                "COMPLETED"
            }
          });

        if (
          completedAppointment
            .dockGroup
            .assignmentMode ===
          "MANUAL"
        ) {
          return {
            finished: true,
            dockReleased:
              dock.code,
            autoAssigned:
              false
          };
        }

        // El dock que se libera puede atender al siguiente turno en
        // espera sin importar su tipo de operación (carga o descarga),
        // ya que el grupo comparte el mismo pool físico de docks.
        const nextAppointment =
          await tx.appointment
            .findFirst({
              where: {
                dockGroupId:
                  completedAppointment.dockGroupId,
                status:
                  "WAITING_DOCK"
              },
              include: {
                supplier: true,
                checkIn: true
              },
              orderBy: {
                createdAt:
                  "asc"
              }
            });

        if (!nextAppointment) {

          return {
            finished: true,
            dockReleased:
              dock.code,
            autoAssigned:
              false
          };

        }

        const newDockOperation =
          await tx.dockOperation
            .create({
              data: {
                dockId: dock.id,
                checkInId:
                  nextAppointment
                    .checkIn.id,
                assignedById:
                  dockOperation
                    .assignedById,
                startedAt:
                  new Date(),
                status:
                  "ASSIGNED"
              }
            });

        await tx.dock.update({
          where: {
            id: dock.id
          },
          data: {
            status:
              "OCCUPIED"
          }
        });

        await tx.appointment
          .update({
            where: {
              id:
                nextAppointment.id
            },
            data: {
              status:
                "IN_OPERATION"
            }
          });

        return {
          finished: true,
          dockReleased:
            dock.code,
          autoAssigned: true,
          nextAppointment: {
            appointmentId:
              nextAppointment.id,
            supplier:
              nextAppointment
                .supplier.name,
            dockCode:
              dock.code,
            dockOperationId:
              newDockOperation.id
          }
        };

      }
    );

  };
const manualAssignDock =
  async (data) => {

    requireFields(data, {
      checkInId: "Check-In",
      dockId: "Dock"
    });

    const { checkInId, dockId, assignedById } = data;

    return prisma.$transaction(
      async (tx) => {

        const checkIn =
          await tx.checkIn.findUnique({
            where: {
              id: checkInId
            },
            include: {
              appointment: true,
              driver: true
            }
          });

        if (!checkIn) {
          throw new AppError(
            "El Check-In indicado no existe."
          );
        }

        const dock =
          await tx.dock.findUnique({
            where: {
              id: dockId
            }
          });

        if (!dock) {
          throw new AppError(
            "El dock indicado no existe."
          );
        }

        if (
          dock.status !== "FREE"
        ) {
          throw new AppError(
            "El dock seleccionado no está disponible."
          );
        }

        const dockOperation =
          await tx.dockOperation.create({
            data: {
              dockId: dock.id,
              checkInId: checkIn.id,
              assignedById,
              startedAt: new Date(),
              status: "ASSIGNED"
            }
          });

        await tx.dock.update({
          where: {
            id: dock.id
          },
          data: {
            status: "OCCUPIED"
          }
        });

        await tx.appointment.update({
          where: {
            id:
              checkIn.appointment.id
          },
          data: {
            status:
              "IN_OPERATION"
          }
        });

        if (
          checkIn.driver &&
          checkIn.driver.phone
        ) {

          try {

            await notificationService
              .sendDockAssignment({
                phone:
                  checkIn.driver.phone,

                driverName:
                  `${checkIn.driver.firstName} ${checkIn.driver.lastName ?? ""}`.trim(),

                dockCode:
                  dock.code
              });

          } catch (error) {

            console.error(
              "Error enviando WhatsApp",
              error.response?.data ||
              error.message
            );

          }

        }

        return {
          assigned: true,
          dockCode: dock.code,
          dockOperation
        };

      }
    );

  };
module.exports = {
  assignDock,
  getQueue,
  finishDockOperation,
  getActiveOperations,
  getDocksByGroup,
  manualAssignDock
};