# IdentityRecon

# Intro

This is a nodeJs program intended to identify and group users who use multiple emails and phone numbers.
The idea behind the app is to treat multiple records as the same if they are linked by a common id or have the same email or phone number.

A detailed description of the problem can be found here [problemLink](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199)

This application is currently live and hosted. You can test the app at [App Link](https://identityrecon.onrender.com/identify/)
###### The app is currently hosted on the free tier. Please, don't misuse the link 😊


If you want to run the app locally follow the process below:

### Step 1: Clone the Repository

`git clone https://github.com/shivammotani/IdentityRecon.git`

### Step 2: Dependencies
  a. This app uses PostgreSQL. You're free to use any other database of your choice. Make sure to update src/db/index.js <br/>
  b. Run the below command 
  <br/>
  ` npm install ` 
  <br/> 
  ` node src/app.js `

### Step 3: API in action
  a. Now make a POST request to the endpoint at ` http://localhost:<PORT>/identify/ `
  b. Make sure to update the PORT value
  c. The body of the request should be in JSON and in the below format 
  ```
    {
      "email": "test@123.com",
      "phoneNumber": "212121"
    }
```
    


### Step 4: If you want to run the test file follow the below steps:
    a. Install Visual Studio
    b. Make sure Google Test is selected as highlighted below

