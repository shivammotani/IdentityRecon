const {
  addPrimaryContact,
  addSecondaryContact,
  searchForContact,
  searchAllLinkedRecords,
  getPrimaryRecords,
  updateDatabase,
} = require("../db/operation");

const { mergeRecords } = require("./helper");

const identifyController = {
  logicController: async (req, res) => {
    var { email, phoneNumber } = req.body;
    //if both email and phone is null then simply return blank data
    if (!email && !phoneNumber)
      return res.status(400).json({
        contact: {
          primaryContatctId: null,
          emails: [],
          phoneNumbers: [],
          secondaryContactIds: [],
        },
      });
    if (
      email === null ||
      email.toLowerCase() === "null" ||
      email.toLowerCase() === "undefined"
    ) {
      email = null;
    }
    if (
      phoneNumber === null ||
      phoneNumber.toLowerCase() === "null" ||
      phoneNumber.toLowerCase() === "undefined"
    ) {
      phoneNumber = null;
    }
    console.log(email, phoneNumber);
    try {
      var dataToBeReturned;
      console.log("Before");
      const resultFromDatabase = await searchForContact(email, phoneNumber);
      console.log("Result" + resultFromDatabase);
      console.log("Result Length" + resultFromDatabase.length);

      //check if data exist for given phone/email. If not create a new Primary contact
      if (resultFromDatabase.length == 0) {
        newRecord = await addPrimaryContact(email, phoneNumber);
        dataToBeReturned = {
          contact: {
            primaryContatctId: newRecord.id,
            emails: [email],
            phoneNumbers: [phoneNumber],
            secondaryContactIds: [null],
          },
        };
      } else if (resultFromDatabase.length == 1) {
        const existingRecord = resultFromDatabase[0];

        //if existingRecord email and phone both matches with value received in request then no new entry has to be made
        // Return all the linked Records for this combination
        if (
          existingRecord.email === email &&
          existingRecord.phoneNumber === phoneNumber
        ) {
          const allLinkedRecords = searchAllLinkedRecords([existingRecord.id]);
          dataToBeReturned = mergeRecords(allLinkedRecords);
        }

        // Either one of the request values is not matching
        //If both of the request values are not null then a new record has to be added
        else {
          if (existingRecord.linkprecedence === "secondary") {
            existingRecord = getPrimaryRecords([existingRecord.id]);
          }
          const allLinkedRecords = searchAllLinkedRecords([existingRecord.id]);

          if (email && phoneNumber) {
            const newContact = addSecondaryContact(
              email,
              phoneNumber,
              existingRecord.id
            );
            allLinkedRecords.push(newContact[0]);
          }
          dataToBeReturned = mergeRecords(allLinkedRecords);
        }
      } else {
        var currentPrimary = null;
        var primaryIdForSecondaryRecords = [];
        var allRecords = [];
        var primaryRecords = resultFromDatabase.filter(
          (record) => record.linkPrecedence === "primary"
        );
        var secondaryRecords = resultFromDatabase.filter(
          (record) => record.linkPrecedence === "secondary"
        );
        var recordsToUpdate = [];
        if (primaryRecords.length > 0) {
          currentPrimary = primaryRecords[0];
        }

        if (secondaryRecords.length > 0) {
          primaryIdForSecondaryRecords = secondaryRecords.map(
            (record) => record.linkedId
          );
        }

        if (primaryIdForSecondaryRecords.length > 0) {
          allRecords = getPrimaryRecords(primaryIdForSecondaryRecords);
          if (currentPrimary) {
            if (currentPrimary.createdAt > allRecords[0].createdAt) {
              currentPrimary = allRecords[0];
              allRecords.splice(0, 1);
            } else {
              primaryRecords.splice(0, 1);
            }
          } else {
            currentPrimary = allRecords[0];
            allRecords.splice(0, 1);
          }
        } else {
          if (currentPrimary) {
            primaryRecords.splice(0, 1);
          }
        }

        primaryRecords.push(...allRecords);
        const idOfRecordsToUpdate = primaryRecords.map((record) => record.id);
        recordsToUpdate = searchAllLinkedRecords(idOfRecordsToUpdate);
        updateDatabase(recordsToUpdate);
        const newContact = addSecondaryContact(
          email,
          phoneNumber,
          currentPrimary.id
        );
        recordsToUpdate.push(newContact[0]);
        dataToBeReturned = mergeRecords(allLinkedRecords, currentPrimary.id);
      }

      res.status(200).json(dataToBeReturned);
    } catch (error) {
      console.error(`Error occurred - ${error}`);
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },
};

module.exports = identifyController;

// with allData as
// (
// select *
// from PUBLIC.USER_DETAILS
// where email = email or phoneNumber = phoneNumber),

// primaryPrecedence as (
//         select *
//         from allData
//         where linkPrecedence = "primary"
// ),
// secondaryPrecedence as (
//         select *
//         from allData
//         where linkPrecedence = "secondary"
// ),

// primaryOfSecondary as (
//         select *
//         from allData
//         where id in (select distinct linkedId from secondaryPrecedence)
// )

// select *
// from PUBLIC.USER_DETAILS
