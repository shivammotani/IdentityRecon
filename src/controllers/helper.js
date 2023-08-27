const mergeRecords = (records) => {
  const emailList = records
    .filter((record) => record.email != null)
    .map((record) => record.email);
  const phoneNumberList = records
    .filter((record) => record.phonenumber != null)
    .map((record) => record.phonenumber);
  const secondaryContactIdsList = records
    .filter((record) => record.linkprecedence == "secondary")
    .map((record) => record.id);

  const consolidatedContacts = {
    //Records are sorted by created date and the oldest record will always be primary
    primaryContactId: records[0].id,
    emails: emailList,
    phoneNumbers: phoneNumberList,
    secondaryContactIds: secondaryContactIdsList,
  };
  return consolidatedContacts;
};
