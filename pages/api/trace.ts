import { IncomingMessage, ServerResponse } from "http";
import createTeamSnapClient from "../../lib/server/teamsnap/createTeamSnapClient";
import loadMe from "../../lib/server/teamsnap/loadMe";
import loadEvent from "../../lib/server/teamsnap/loadEvent";
import initFirebaseAdmin from "../../lib/server/initFirebaseAdmin";
import formatDate from "date-fns/format";

export default async function trace(
  req: IncomingMessage & { body: any; query: any; cookies: any },
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }

  const { eventId, authToken, org } = req.body;
  if (!(eventId && authToken)) {
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
    res.statusCode = 404;
    res.end("No such org: " + org);
    return;
  }
  const client = createTeamSnapClient(authToken);
  const user = await loadMe(client);
  const event = await loadEvent(client, eventId);
  const teamId = event.teamId;
  const accessOk =
    !!user.ownedTeamIds?.includes(teamId) ||
    !!user.managedTeamIds?.includes(teamId) ||
    !!user.isAdmin;
  if (!accessOk) {
    const adminsCollection = orgDoc.collection("admins");
    const adminDocs = await adminsCollection
      .where("email", "==", user.email)
      .get();
    if (adminDocs.empty) {
      const warning = `User is not a team manager or admin, not returning any checkins for 
      ${user.email} in ${org} for event ${eventId} in team ${event.teamId}
      with location ${event.locationName} and start time ${event.startDate}
      `;
      console.log(warning);
      res.end(JSON.stringify({ items: [], warning }));
      return;
    }
  }

  console.log(eventId, event.startDate);

  const checkinsCollection = orgDoc.collection("checkins");
  const matchingCheckins = await checkinsCollection
    .where("eventLocation", "==", event.locationName)
    .where("eventTime", "==", formatDate(event.startDate, "HH:mm"))
    .where("eventDate", "==", formatDate(event.startDate, "yyyy-MM-dd"))
    .get();
  const items = matchingCheckins.docs.map((ci) => ({
    memberName: ci.get("memberName"),
    contactName: ci.get("contactName"),
    contactEmails: ci.get("contactEmails"),
    contactPhoneNumbers: ci.get("contactPhoneNumbers"),
    passed: ci.get("passed"),
  }));
  res.end(JSON.stringify({ items }));
}
