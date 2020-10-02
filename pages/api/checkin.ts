import initFirebaseAdmin from "lib/server/initFirebaseAdmin";
import { IncomingMessage, ServerResponse } from "http";
import { JSONSchema7 } from "json-schema";
import Ajv from "ajv";
import axios from "axios";

const checkinSchema: JSONSchema7 = {
  properties: {
    attendeeNames: { type: "string" },
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
    org: { type: "string" },
    passed: { type: "boolean" },
    teamSnapEventId: { type: "number" },
    teamSnapTeamId: { type: "number" },
    timestamp: { type: "string", format: "date-time" },
  },
  required: [
    "attendeeNames",
    "contactPhoneNumbers",
    "contactEmails",
    "eventLocation",
    "eventDate",
    "eventTime",
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
  if (req.method === "POST") {
    if (!ajv.validate(checkinSchema, req.body)) {
      res.statusCode = 400;
      res.end(ajv.errorsText());
      return;
    }
    const admin = initFirebaseAdmin();
    const firestore = admin.firestore();
    const orgsCollection = firestore.collection("orgs");
    const orgDoc = orgsCollection.doc(req.body.org);
    const org = await orgDoc.get();
    if (!org) {
      res.statusCode = 404;
      res.end("No such org: " + org);
      return;
    }
    const checkinsCollection = orgDoc.collection("checkins");
    await checkinsCollection.add({
      ...req.body,
      timestamp: new Date(req.body.timestamp),
    });
    const formUrl = org.get("googleFormUrl");
    if (formUrl) {
      const parsed = new URL(formUrl);
      parsed.pathname = parsed.pathname.replace("/viewform", "/formResponse");
      const qs = parsed.searchParams;
      const subs = {
        attendeeNames: req.body.attendeeNames,
        contactPhoneNumber: req.body.contactPhoneNumbers.join(", "),
        contactEmail: req.body.contactEmails.join(", "),
        eventLocation: req.body.eventLocation,
        eventDate: req.body.eventDate,
        eventTime: req.body.eventTime,
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
      console.log(parsed.toString(), res.status, res.statusText);
    }
    res.statusCode = 200;
  } else {
    res.statusCode = 405;
  }
  res.end();
}
