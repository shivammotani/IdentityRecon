const client = require("./index");

const addPrimaryContact = async (email, phone) => {
  console.log("rea");
  console.log(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values ($1, $2, $3, $4, $5) RETURNING *",
    [email, phone, null, "primary", null]
  );
  const record = await client.query(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values ($1, $2, $3, $4, $5) RETURNING *",
    [email, phone, null, "primary", null]
  );
  return record.rows;
};

const addSecondaryContact = async ({ email, phone, linkedId }) => {
  const record = await client.query(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values ($1, $2, $3, $4, $5) RETURNING *",
    [email, phone, linkedId, "secondary", null]
  );
  return record.rows;
};

const searchForContact = async (email, phone) => {
  const record = await client.query(
    ` SELECT * FROM PUBLIC.USER_DETAILS where (email = '${email}' or  phoneNumber = '${phone}') `
  );
  return record.rows;
};

const searchAllLinkedRecords = async (allIDList) => {
  const record = await client.query(
    "SELECT * FROM PUBLIC.USER_DETAILS where  (id in ( $1 )  OR linkedId in ( $2 )) ORDER BY createdAt",
    [allIDList, allIDList]
  );
  return record.rows;
};

const getPrimaryRecords = async (id) => {
  const record = await client.query(
    "SELECT * FROM PUBLIC.USER_DETAILS where id in ( $1 ) ORDER BY createdAt",
    [id]
  );
  return record.rows;
};

const updateDatabase = async (recordsToUpdate, primaryRecordId) => {
  const idOfRecords = recordsToUpdate.map((record) => record.id);
  const record = await client.query(
    "UPDATE PUBLIC.USER_DETAILS SET linkedId=$1 and linkPrecedence=$2 where id in ( $3 )",
    [primaryRecordId, "secondary", idOfRecords]
  );
};

module.exports = {
  addPrimaryContact,
  addSecondaryContact,
  searchForContact,
  searchAllLinkedRecords,
  getPrimaryRecords,
  updateDatabase,
};
