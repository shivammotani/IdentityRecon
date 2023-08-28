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
    if (phoneNumber) phoneNumber = phoneNumber.toString();

    //if both email and phone is null then simply return blank data
    if (!email && !phoneNumber) {
      return res.status(400).json({
        contact: {
          primaryContatctId: null,
          emails: [],
          phoneNumbers: [],
          secondaryContactIds: [],
        },
      });
    }

    //Make email and phonenumber as null if they're not valid
    if (
      email === null ||
      email.trim() === "" ||
      email.toLowerCase() === "null" ||
      email.toLowerCase() === "undefined"
    ) {
      email = null;
    }
    if (
      phoneNumber === null ||
      phoneNumber.trim() === "" ||
      phoneNumber.toLowerCase() === "null" ||
      phoneNumber.toLowerCase() === "undefined"
    ) {
      phoneNumber = null;
    }

    try {
      var dataToBeReturned;

      //search database for the current combination coming from the POST request
      const resultFromDatabase = await searchForContact(email, phoneNumber);

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

        //If there is only one matching record
      } else if (resultFromDatabase.length == 1) {
        var existingRecord = [resultFromDatabase[0]];
        //if existingRecord email and phone both matches with value received in request then no new entry has to be made
        // Return all the linked Records for this combination
        if (
          existingRecord.email === email &&
          existingRecord.phonenumber === phoneNumber
        ) {
          const allLinkedRecords = await searchAllLinkedRecords([
            existingRecord.id,
          ]);
          dataToBeReturned = mergeRecords(allLinkedRecords);
        }

        // Either one of the request values is not matching
        //If both of the request values are not null then a new record has to be added
        else {
          if (existingRecord[0].linkprecedence === "secondary") {
            existingRecord = await getPrimaryRecords([
              existingRecord[0].linkedid,
            ]);
          }

          const allLinkedRecords = await searchAllLinkedRecords([
            existingRecord[0].id,
          ]);

          if (email && phoneNumber) {
            const newContact = await addSecondaryContact(
              email,
              phoneNumber,
              existingRecord[0].id
            );
            allLinkedRecords.push(newContact[0]);
          }
          dataToBeReturned = mergeRecords(allLinkedRecords);
        }
      } else {
        /** If there are multiple matches in the databse the one of the below scenario is applicable:
         * Scenario 1: All are Primary Records:
         *  a. For this scenario get all the linked records
         *  b. Get the secondary for all the the primary records
         *  c. Convert all primary to secondary except the oldest primary and update the linkedId of all the existing secondary with the oldest primary id
         *  d. If request has new information create a new secondary record
         *  e. Return all the merged records
         *
         * Scenario 2: All are Secondary Records:
         *  a. Get the primary for all the secondary Records. Identify the oldest primary
         *  b. Get all the linked Records for the primary records fetched from step 1
         *  c. Convert all primary to secondary except the oldest primary and update the linkedId of all the linked records from step 2 with the oldest primary id
         *  d. If request has new information create a new secondary record
         *  e. Return all the merged records
         *
         * Scenario 3: There is a mix of both primary and secondary records
         *  a. We can not say for sure if the 1st record from the primary list will be the oldest. There might be case when there are two completely disconnected records and the new
         *     request has some information which can link both the data. Now imagine a scenario where you got some primary from the 1st group and a secondary record from the 2nd group
         *     If the second group primary is the oldest then all the matching records has to be updated with the oldest primary
         *  b. Separate primary and secondary records from the existing search
         *  c. For all the secondary identify the primary and get all the linked records for these primary
         *  d. From all the primary records select the oldest primary record
         *  e. Update all the records to secondary and linkedId with the oldest primary except the selected oldest primary
         */
        var currentPrimary = null;
        var primaryIdForSecondaryRecords = [];
        var allRecords = [];

        //Boolean to check if any record has the same email from request
        var emailFound = resultFromDatabase.some(
          (record) => record.email === email
        );
        //Boolean to check if any record has the same phoone from request
        var phoneFound = resultFromDatabase.some(
          (record) => record.phonenumber === phoneNumber
        );

        //Separate Primary and Secondary
        var primaryRecords = resultFromDatabase.filter(
          (record) => record.linkprecedence === "primary"
        );
        var secondaryRecords = resultFromDatabase.filter(
          (record) => record.linkprecedence === "secondary"
        );
        var recordsToUpdate = [];

        // If there is any primary record then make the 1st records as oldest as data is already sorted
        if (primaryRecords.length > 0) {
          currentPrimary = primaryRecords[0];
        }

        // If there is any secondary record then get the linkedId for these except the primary record which is already selected
        if (secondaryRecords.length > 0) {
          if (currentPrimary) {
            primaryIdForSecondaryRecords = secondaryRecords
              .filter((record) => record.linkedid != currentPrimary.id)
              .map((record) => record.linkedid);
          } else {
            primaryIdForSecondaryRecords = secondaryRecords.map(
              (record) => record.linkedid
            );
          }
        }

        //If there are new primary records from the seconday records list then check if any of these primary is oldest than the selected primary
        //Remove the oldest selected primary record from the list to avoid updation later
        if (primaryIdForSecondaryRecords.length > 0) {
          allRecords = await getPrimaryRecords(primaryIdForSecondaryRecords);

          if (currentPrimary) {
            if (currentPrimary.createdat > allRecords[0].createdat) {
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
          primaryRecords.splice(0, 1);
        }

        //store all the primary together
        primaryRecords.push(...allRecords);

        if (primaryRecords.length > 0) {
          //Get linked records for all the primary and update them with new information
          //The oldest records won't get updated as it's already removed from the list in the previous steps
          const idOfRecordsToUpdate = primaryRecords.map((record) => record.id);
          recordsToUpdate = await searchAllLinkedRecords(idOfRecordsToUpdate);
          allRecords = await updateDatabase(recordsToUpdate, currentPrimary.id);
          const linkedRecordsForCurrentPrimary = await searchAllLinkedRecords([
            currentPrimary.id,
          ]);
          allRecords.push(...linkedRecordsForCurrentPrimary);
        } else {
          //if there was no secondary records all for all secondary the primary was same then just fetch all the linked records
          allRecords = await searchAllLinkedRecords([currentPrimary.id]);
        }

        //if the reuest brought new information and is valid then create new secondary records and update
        if (!emailFound && !phoneFound) {
          const newContact = await addSecondaryContact(
            email,
            phoneNumber,
            currentPrimary.id
          );
          allRecords.push(newContact[0]);
        }

        //Merge all the identified records to be sent as response
        dataToBeReturned = mergeRecords(allRecords);

        //Update the primary with the id of the selcted oldest primary record
        dataToBeReturned.contact.primaryContactId = currentPrimary.id;
      }

      //return the response
      res.status(200).json(dataToBeReturned);
    } catch (error) {
      //If there was any error return and print the error
      console.error(`Error occurred - ${error}`);
      res.status(500).json({
        message: "Something went wrong!",
      });
    }
  },
};

module.exports = identifyController;
