const prisma = require("../../lib/prisma");
const notificationService =
  require("../../services/notification.service");

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
                supplier: true
              }
            }
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

const assignDock = async ({
  checkInId,
  assignedById
}) => {

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
      throw new Error(
        "CheckIn not found"
      );
    }

    const appointment =
      checkIn.appointment;

    if (
      appointment.status !== "WAITING_DOCK" &&
      appointment.status !== "CHECKED_IN"
    ) {
      throw new Error(
        `Appointment status is ${appointment.status}`
      );
    }

    const dock =
      await tx.dock.findFirst({
        where: {
          groupId:
            appointment.dockGroupId,
          operationType:
            appointment.operationType,
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
  async ({
    dockOperationId
  }) => {

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
                    }
                  }
                }
              }
            });

        if (!dockOperation) {
          throw new Error(
            "Dock operation not found"
          );
        }

        if (
          dockOperation.status ===
          "FINISHED"
        ) {
          throw new Error(
            "Dock operation already finished"
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

        const nextAppointment =
          await tx.appointment
            .findFirst({
              where: {
                dockGroupId:
                  completedAppointment.dockGroupId,
                operationType:
                  completedAppointment.operationType,
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
  async ({
    checkInId,
    dockId,
    assignedById
  }) => {

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
          throw new Error(
            "CheckIn not found"
          );
        }

        const dock =
          await tx.dock.findUnique({
            where: {
              id: dockId
            }
          });

        if (!dock) {
          throw new Error(
            "Dock not found"
          );
        }

        if (
          dock.status !== "FREE"
        ) {
          throw new Error(
            "Dock is not available"
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