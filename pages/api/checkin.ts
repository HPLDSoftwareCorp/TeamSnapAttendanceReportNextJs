import initFirebaseAdmin from "lib/server/initFirebaseAdmin";
import { IncomingMessage, ServerResponse } from "http";
import { JSONSchema7 } from "json-schema";
import Ajv from "ajv";
import axios from "axios";

const checkinSchema: JSONSchema7 = {
  properties: {
    memberName: { type: "string" },
    contactName: { type: "string" },
    contactPhoneNumbers: {
      type: "array",
      items: {
        type: "string",
      },
    },
    contactEmails: {
      type: "array",
      items: {
        type: "string",
      },
    },
    eventLocation: { type: "string" },
    eventDate: { type: "string" },
    eventTime: { type: "string" },
    eventTimestamp: { type: "string", format: "date-time" },
    org: { type: "string" },
    passed: { type: "boolean" },
    teamSnapEventId: { type: "number" },
    teamSnapTeamId: { type: "number" },
    timestamp: { type: "string", format: "date-time" },
  },
  required: [
    "memberName",
    "contactPhoneNumbers",
    "contactEmails",
    "eventLocation",
    "eventDate",
    "eventTime",
    "eventTimestamp",
    "org",
    "passed",
    "timestamp",
  ],
  type: "object",
};
const ajv = new Ajv();

export default async function checkin(
  req: IncomingMessage & { body: any; query: any; cookies: any },
  res: ServerResponse
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end();
    return;
  }
  const { org, timestamp } = req.body;
  if (!ajv.validate(checkinSchema, req.body)) {
    res.statusCode = 400;
    res.end(ajv.errorsText());
    return;
  }
  const admin = initFirebaseAdmin();
  const firestore = admin.firestore();
  const orgsCollection = firestore.collection("orgs");
  const orgDoc = orgsCollection.doc(org);
  const orgData = await orgDoc.get();
  if (!orgData) {
    res.statusCode = 404;
    res.end("No such org: " + org);
    return;
  }
  const checkinsCollection = orgDoc.collection("checkins");
  await checkinsCollection.add({
    ...req.body,
    eventTimestamp: new Date(req.body.eventTimestamp),
    timestamp: new Date(timestamp),
  });
  const formUrl = orgData.get("googleFormUrl");
  if (formUrl) {
    const parsed = new URL(formUrl);
    parsed.pathname = parsed.pathname.replace("/viewform", "/formResponse");
    const qs = parsed.searchParams;
    const subs: { [k: string]: string | undefined } = {
      memberName: req.body.memberName,
      contactName: req.body.contactName,
      contactPhoneNumber: req.body.contactPhoneNumbers.join(", "),
      contactEmail: req.body.contactEmails.join(", "),
      eventLocation: req.body.eventLocation,
      eventDate: req.body.eventDate,
      eventTime: req.body.eventTime,
      eventTimestamp: req.body.eventTimestamp,
      pass: !req.body.passed ? "Fail" : "Pass",
      userId: req.body.userId,
    };
    for (const [k, v] of Array.from(qs.entries())) {
      const sub = subs[v];
      if (sub) {
        qs.set(k, sub);
      }
    }
    qs.set("submit", "Submit");
    const res = await axios.get(parsed.toString());
  }
  res.statusCode = 200;
  res.end();
}
