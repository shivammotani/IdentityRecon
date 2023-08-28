// This will help to consolidate all the information for the given request, ready to be sent as response
const mergeRecords = (records) => {
  var emailList = records
    .filter((record) => record.email != null)
    .map((record) => record.email);
  //remove the duplicates
  emailList = [...new Set(emailList)];

  var phoneNumberList = records
    .filter((record) => record.phonenumber != null)
    .map((record) => record.phonenumber);
  //remove the duplicates
  phoneNumberList = [...new Set(phoneNumberList)];

  var secondaryContactIdsList = records
    .filter((record) => record.linkprecedence == "secondary")
    .map((record) => record.id);
  //remove the duplicates
  secondaryContactIdsList = [...new Set(secondaryContactIdsList)];

  const consolidatedContacts = {
    //Records are sorted by created date and the oldest record will always be primary
    contact: {
      primaryContactId: records[0].id,
      emails: emailList,
      phoneNumbers: phoneNumberList,
      secondaryContactIds: secondaryContactIdsList,
    },
  };
  return consolidatedContacts;
};

module.exports = { mergeRecords };
