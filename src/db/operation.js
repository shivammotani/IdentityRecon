const client = require("./index");

const addPrimaryContact = async ({ email, phone }) => {
  const record = await client.query(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values (?,?,?,?,?) RETURNING *",
    [email, phone, null, "primary", null]
  );
  return record.rows;
};

const addSecondaryContact = async ({ email, phone, linkedId }) => {
  const record = await client.query(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values (?,?,?,?,?) RETURNING *",
    [email, phone, linkedId, "secondary", null]
  );
  return record.rows;
};

const searchForContact = async ({ email, phone }) => {
  const record = await client.query(
    ` SELECT * FROM PUBLIC.USER_DETAILS where (email = '${email}' or  phoneNumber = ${phone}) `
  );
  return record.rows;
};

const searchAllLinkedRecords = async (id) => {
  const record = await client.query(
    ` SELECT * FROM PUBLIC.USER_DETAILS where (id = '${id}' OR linkedId = '${id}')  ORDER BY createdAt`
  );
  return record.rows;
};

const getPrimaryRecord = async (id) => {
  const record = await client.query(
    ` SELECT * FROM PUBLIC.USER_DETAILS where id = '${id}' ORDER BY createdAt`
  );
  return record.rows;
};
