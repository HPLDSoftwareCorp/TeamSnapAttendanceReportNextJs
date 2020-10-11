import loadTeamSnap from "./teamsnap/loadTeamSnap";
import memoize from "lodash/memoize";
import { CheckinDoc } from "../CheckinDoc";
import axios from "axios";

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
    return axios
      .post("/api/trace", { authToken, eventId, org })
      .then((r) => r.data.items);
  },
  (eventId: number, org: string) => [eventId, org].join(", ")
);
