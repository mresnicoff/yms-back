const prisma =
  require("../../lib/prisma");

const validateCheckIn =
  async ({
    driverId,
    truckId,
    operationType
  }) => {

    const requiredDocuments =
      await prisma.requiredDocument.findMany({
        where: {
          operationType,
          active: true
        },
        include: {
          documentType: true
        }
      });

    const missingDocuments = [];

    const expiredDocuments = [];

    for (const requirement of requiredDocuments) {

      let document = null;

      if (
        requirement.ownerType ===
        "DRIVER"
      ) {

        document =
          await prisma.document.findFirst({
            where: {
              driverId,
              documentTypeId:
                requirement.documentTypeId,
              active: true
            }
          });

      }

      if (
        requirement.ownerType ===
        "TRUCK"
      ) {

        document =
          await prisma.document.findFirst({
            where: {
              truckId,
              documentTypeId:
                requirement.documentTypeId,
              active: true
            }
          });

      }

      if (!document) {

        missingDocuments.push(
          requirement.documentType.name
        );

        continue;

      }

      if (
        document.expirationDate &&
        new Date(
          document.expirationDate
        ) < new Date()
      ) {

        expiredDocuments.push(
          requirement.documentType.name
        );

      }

    }

    return {
      valid:
        missingDocuments.length === 0 &&
        expiredDocuments.length === 0,

      missingDocuments,

      expiredDocuments
    };

  };

module.exports = {
  validateCheckIn
};