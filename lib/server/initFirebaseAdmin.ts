export default function initFirebaseAdmin() {
  const admin = require("firebase-admin");
  if (!admin.apps.length) {
    let credsJson = process.env.FIREBASE_CREDENTIALS_JSON;
    if (!credsJson)
      throw new Error("Missing FIREBASE_CREDENTIALS_JSON environment variable");
    const serviceAccount = JSON.parse(credsJson);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://teamsnapattendancereporting.firebaseio.com",
    });
  }
  return admin;
}
