import loadTeamSnap from "./teamsnap/loadTeamSnap";
import memoize from "lodash/memoize";
import { CheckinDoc } from "../CheckinDoc";

export default memoize(
  async function fetchFormCheckins(
    eventId: number,
    org: string
  ): Promise<CheckinDoc[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    const authToken = sessionStorage.getItem("teamsnap.authToken");
    return fetch("/api/trace", {
      body: JSON.stringify({ authToken, eventId, org }),
      headers: { "content-type": "application/json" },
      method: "POST",
    })
      .then((r) => r.json())
      .then((j) => j.items);
  },
  (eventId: number, org: string) => [eventId, org].join(", ")
);
