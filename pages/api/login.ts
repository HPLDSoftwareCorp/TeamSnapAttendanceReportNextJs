import { IncomingMessage, ServerResponse } from "http";
import createTeamSnapClient from "../../lib/server/teamsnap/createTeamSnapClient";
import loadMe from "../../lib/server/teamsnap/loadMe";
import initFirebaseAdmin from "../../lib/server/firebase/initFirebaseAdmin";

export default async function trace(
  req: IncomingMessage & { body: any; query: any; cookies: any },
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const { authToken, org } = req.body;
  if (!(org && authToken)) {
    res.statusCode = 400;
    res.end("Missing parameters");
    return;
  }
  const firebase = initFirebaseAdmin();
  const firestore = firebase.firestore();
  const orgsCollection = firestore.collection("orgs");
  const orgDoc = orgsCollection.doc(req.body.org);
  const orgData = await orgDoc.get();
  if (!orgData) {
    console.error("login request for invalid org", org);
    res.statusCode = 404;
    res.end("No such org: " + org);
    return;
  }
  const client = createTeamSnapClient(authToken);
  const teamSnapUser = await loadMe(client);
  console.log(teamSnapUser);
  const uid = String(teamSnapUser.id);
  console.log(uid);
  const usersCollection = orgDoc.collection("users");
  const userDoc = await usersCollection.doc(uid);
  userDoc.set({
    ...teamSnapUser,
    lastLogin: new Date(),
  });
  userDoc.collection("log").add({
    action: "login",
    timestamp: new Date(),
  });
  const firebaseAuthToken = await firebase.auth().createCustomToken(uid);
  const displayName = [teamSnapUser.firstName, teamSnapUser.lastName].join(" ");
  try {
    const user = await firebase.auth().getUser(uid);
    if (
      user.displayName !== displayName ||
      (teamSnapUser.email && user.email !== teamSnapUser.email)
    ) {
      await firebase
        .auth()
        .updateUser(uid, {
          displayName,
          email: teamSnapUser.email,
          emailVerified: !!teamSnapUser.email,
        });
    }
  } catch (err) {
    await firebase.auth().createUser({
      displayName,
      email: teamSnapUser.email,
      emailVerified: !!teamSnapUser.email,
      uid: uid,
    });
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ firebaseAuthToken }));
}
