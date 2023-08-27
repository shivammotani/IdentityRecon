const e = require("express");
const {
  addPrimaryContact,
  addSecondaryContact,
  searchForContact,
  mergeRecords,
  searchAllLinkedRecords,
  getPrimaryRecord,
} = require("../db/operation");

const {
        mergeRecords,
      } = require("./helper");

identifyController: async (req, res) => {
  var { email, phoneNumber } = req.body;
  if(email === null || email.toLowerCase() === "null" || email.toLowerCase() === "undefined"){
        email = null
  }
  if(phoneNumber === null || phoneNumber.toLowerCase() === "null" || phoneNumber.toLowerCase() === "undefined"){
        phoneNumber = null
  }
  //if both email and phone is null then simply return blank data
  if (email == null && phoneNumber == null) {
    res.json({
      contact: {
        primaryContatctId: null,
        emails: [],
        phoneNumbers: [],
        secondaryContactIds: [],
      },
    });
    return;
  }

  try{
        var dataToBeReturned;
        const resultFromDatabase = await searchForContact(email, phoneNumber)

        //check if data exist for given phone/email. If not create a new Primary contact
        if(resultFromDatabase.length == 0){
                newRecord = await addPrimaryContact(email, phoneNumber)
                dataToBeReturned = {
                        "contact":{
                                "primaryContatctId": newRecord.id,
                                "emails": email,
                                "phoneNumbers": phoneNumber,
                                "secondaryContactIds": null
                        }
                }
        }


        else if (resultFromDatabase.length == 1){
                const existingRecord = resultFromDatabase[0];
                
                //if existingRecord email and phone both matches with value received in request then no new entry has to be made
                // Return all the linked Records for this combination
                if(existingRecord.email === email && existingRecord.phoneNumber === phoneNumber){
                        const allLinkedRecords = searchAllLinkedRecords(existingRecord.id)
                        dataToBeReturned = mergeRecords(allLinkedRecords);
                }

                // Either one of the request values is not matching 
                //If both of the request values are not null then a new record has to be added
                else{
                        if(existingRecord.linkprecedence === "secondary"){
                                existingRecord = getPrimaryRecord(existingRecord.id)
                        }
                        const allLinkedRecords = searchAllLinkedRecords(existingRecord.id)

                        if(email && phoneNumber){
                                const newContact = addSecondaryContact({email, phoneNumber, existingRecord.id})
                                allLinkedRecords.push(newContact[0])
                        } 
                        dataToBeReturned = mergeRecords(allLinkedRecords);
                        
                }


        }

        return dataToBeReturned

  }




};
