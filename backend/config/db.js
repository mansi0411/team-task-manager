/**
 * Database connection module
 * Uses Mongoose to connect to MongoDB Atlas
 */

const mongoose = require("mongoose");

/**
 * Hide password in connection string when logging (safe for terminal output)
 */
const maskMongoUri = (uri) => {
  if (!uri) return "(empty)";
  return uri.replace(/:([^@]+)@/, ":****@");
};

/**
 * Connect to MongoDB using the URI from environment variables
 */
const connectDB = async () => {
  // Trim spaces/quotes that sometimes get copied into .env by mistake
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error(
      "MONGO_URI is missing. Add it to backend/.env and save the file."
    );
    process.exit(1);
  }

  mongoUri = mongoUri.trim();

  // Remove surrounding quotes if dotenv or copy-paste left them in the value
  if (
    (mongoUri.startsWith('"') && mongoUri.endsWith('"')) ||
    (mongoUri.startsWith("'") && mongoUri.endsWith("'"))
  ) {
    mongoUri = mongoUri.slice(1, -1).trim();
  }

  // Log right before connect (masked) — helps debug without exposing password
  console.log("Connecting with MONGO_URI (masked):", maskMongoUri(mongoUri));
  console.log("URI scheme valid:", /^mongodb(\+srv)?:\/\//.test(mongoUri));

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
