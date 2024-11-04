# emotorad-assignment
## Backend Developer Intern
# Contact Identity Reconciliation Service

This service is designed to handle identity reconciliation by managing contacts based on their email addresses and phone numbers. The `/identify` endpoint allows for identifying, creating, and linking contacts based on these attributes.

## Features
- Accepts email and/or phone number to find or create contact records.
- Maintains unique primary contacts while associating secondary contacts to the primary one.
- Validates input format for email and phone number.
- Returns structured JSON response with primary and secondary contact information.

## Technologies Used

- **Node.js** - Server runtime
- **Express** - Web framework for Node.js
- **MongoDB** - Database to store contact information

## Getting Started

# for installing dependencies 
```bash
npm install
```

# Create a .env file in the project root and add your MongoDB connection URI:

```bash
DB_URI=your_mongodb_uri
```
# For frontend

to run the frontend.html file u can use the Live Server Extension

# For Backend

run the command

```bash
node server.js
```

### Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)
- [npm](https://www.npmjs.com/) (Node Package Manager)





