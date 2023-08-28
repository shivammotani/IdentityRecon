const client = require("./index");

//Create a new entry in database if no match found
const addPrimaryContact = async (email, phone) => {
  const record = await client.query(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values ($1, $2, $3, $4, $5) RETURNING *",
    [email, phone, null, "primary", null]
  );
  return record.rows;
};

//Create a new entry in database if there is match but the reuest brought new information for the user
const addSecondaryContact = async (email, phone, linkedId) => {
  const record = await client.query(
    "INSERT INTO PUBLIC.USER_DETAILS (email,phoneNumber,linkedId,linkPrecedence,deletedAt) values ($1, $2, $3, $4, $5) RETURNING *",
    [email, phone, linkedId, "secondary", null]
  );
  return record.rows;
};

//Search for an existing user in the database
const searchForContact = async (email, phone) => {
  const record = await client.query(
    ` SELECT * FROM PUBLIC.USER_DETAILS where (email = '${email}' or  phoneNumber = '${phone}') ORDER BY createdAt`
  );
  return record.rows;
};

//Search and Return all records where any entry is either primary or secondary record for the request
const searchAllLinkedRecords = async (allIDList) => {
  const record = await client.query(
    "SELECT * FROM PUBLIC.USER_DETAILS where  (id = ANY ( $1 )  OR linkedid = ANY ( $2 )) ORDER BY createdAt",
    [allIDList, allIDList]
  );

  return record.rows;
};

//Search and Return all the primary records for the given list of secondary records linkedid
const getPrimaryRecords = async (allIDList) => {
  const record = await client.query(
    "SELECT * FROM PUBLIC.USER_DETAILS where id = ANY ($1) ORDER BY createdAt",
    [allIDList]
  );
  return record.rows;
};

//Update the existing databse with the new information
const updateDatabase = async (recordsToUpdate, primaryRecordId) => {
  const idOfRecords = recordsToUpdate.map((record) => record.id);
  const record = await client.query(
    "UPDATE PUBLIC.USER_DETAILS SET linkedid = $1 , linkprecedence = $2 where id = ANY ( $3 ) RETURNING *",
    [primaryRecordId, "secondary", idOfRecords]
  );
  return record.rows;
};

module.exports = {
  addPrimaryContact,
  addSecondaryContact,
  searchForContact,
  searchAllLinkedRecords,
  getPrimaryRecords,
  updateDatabase,
};
