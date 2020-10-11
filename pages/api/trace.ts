import { IncomingMessage, ServerResponse } from "http";
import createTeamSnapClient from "../../lib/server/teamsnap/createTeamSnapClient";
import loadMe from "../../lib/server/teamsnap/loadMe";
import loadEvent from "../../lib/server/teamsnap/loadEvent";
import initFirebaseAdmin from "../../lib/server/firebase/initFirebaseAdmin";
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
  if (!(eventId && authToken && org)) {
    res.statusCode = 400;
    res.end("Missing parameters");
    return;
  }
  const firebase = initFirebaseAdmin();
  const firestore = firebase.firestore();
  const orgsCollection = firestore.collection("orgs");
  const orgDoc = orgsCollection.doc(org);
  const orgData = await orgDoc.get();
  if (!orgData) {
    console.error("trace request for invalid org", org);
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
    !!user.commissionedTeamIds?.includes(teamId) ||
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
      res.end(JSON.stringify({ items: [], warning }));
      return;
    }
  }

  const eventTime = formatDate(event.startDate, "HH:mm");
  const eventDate = formatDate(event.startDate, "yyyy-MM-dd");
  console.log({
    eventId,
    eventDate,
    eventTime,
    eventTimestamp: event.startDate,
    eventLocation: event.locationName,
    startDate: event.startDate,
  });

  const checkinsCollection = orgDoc.collection("checkins");
  const matchingCheckins = await checkinsCollection
    .where("eventLocation", "==", event.locationName)
    .where("eventTimestamp", "==", event.startDate)
    .get();
  const items = matchingCheckins.docs.map((doc: any) => doc.data());
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ items }));
}
