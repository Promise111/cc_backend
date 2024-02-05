const Transaction = require("../user/transaction.model")

const mailSource =
  "Coin Capital Investments <support@coincapitalinvestments.com>";

function generateUniqueId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueId = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters.charAt(randomIndex);
  }

  return uniqueId;
}

async function generateUniqueMongoId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueId = "";

  const isUnique = async (idToCheck) => {
    try {
      const existingDoc = await Transaction.findOne({ uniqueId: idToCheck });
      return !existingDoc;
    } catch (error) {
      console.error("Error checking uniqueness:", error);
      return false;
    }
  };

  while (true) {
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters.charAt(randomIndex);
    }

    if (await isUnique(uniqueId)) {
      return uniqueId;
    }
    uniqueId = "";
  }
}

module.exports = { mailSource, generateUniqueId };
