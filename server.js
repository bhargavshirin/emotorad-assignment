//all the libraries and packages
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Contact = require('./models/Contact');

const app = express();
app.use(cors());
app.use(express.json());

const dbURI = process.env.DB_URI;
if (!dbURI) {
  console.error("Error: DB_URI not set in environment variables");
  process.exit(1);
}
// post request in /identify route
app.post('/identify', async (req, res) => {

   //mail and phoneNumber from the request body
    const { email, phoneNumber } = req.body;

   // Validate that at least one of email or phoneNumber is provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ error: "Email or phone number is required" });
    }

    // Validate that email, if provided, is a string
    if (email && typeof email !== "string") {
      return res.status(400).json({ error: "Email must be a string" });
    }

    // Validate that phoneNumber, if provided, is a string
    if (phoneNumber && typeof phoneNumber !== "string") {
      return res.status(400).json({ error: "Phone number must be a string" });
    }

    // Check if the email has a valid format using a regular expression
    if (email && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
  
    try {
      // Fetch contacts that match either the email or phone number
     const matches = await Contact.find({
        $or : [{ email }, { phoneNumber }]
      });

      // Check if there's already a contact with the same email and phone number
      const existingContact = matches.find(contact => contact.email === email && contact.phoneNumber === phoneNumber);
      if (existingContact) {
        return res.status(409).json({ error: "A contact with the same email and phone number already exists." });
      }
  
      // If no matches are found, we will create a new primary contact
      if (matches.length === 0) {
        const newContact = await Contact.create({ email, phoneNumber, linkPrecedence: "primary" });
        return res.status(200).json({
          primaryContactId: newContact._id,
          emails: [email],
          phoneNumbers: [phoneNumber],
          secondaryContactIds: []
        });
      }
  
      // Set to store unique emails and phone numbers for no duplicates
      let emailList = new Set([email]);
      let phoneList = new Set([phoneNumber]);
      let secondaryIds = [];
      let primaryContact = matches.find(contact => contact.linkPrecedence === "primary");
  
      // If no primary contact exists, use the first match as the primary
      if (!primaryContact) {
        primaryContact = matches[0];
        await primaryContact.updateOne({ linkPrecedence: "primary" });
      }
  
      // data in email, phone, and secondary IDs lists
      matches.forEach(contact => {
        if (contact.email) emailList.add(contact.email);
        if (contact.phoneNumber) phoneList.add(contact.phoneNumber);
        if (contact.linkPrecedence === "secondary") secondaryIds.push(contact._id);
      });
  
      // Create a secondary contact for the current email/phone number, if needed
      const newContact = await Contact.create({
        email,
        phoneNumber,
        linkedId: primaryContact._id,
        linkPrecedence: "secondary"
      });
      secondaryIds.push(newContact._id);
  
      res.status(200).json({
        primaryContactId: primaryContact._id,
        emails: Array.from(emailList),
        phoneNumbers: Array.from(phoneList),
        secondaryContactIds: secondaryIds
      });
    } catch (error) {
      console.error("Error processing /identify request:", error);
      res.status(500).json({ error: "A processing error occurred. Please try again later." });
    }
});

// Database connection
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(3000, () => console.log("Server running on port 3000")))
  .catch(error => console.error("Database connection error:", error));
