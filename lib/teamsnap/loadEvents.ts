import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapEvent } from "./TeamSnap";

export default memoize(
  async function loadEvents(
    teamId: number,
    startedAfter: Date,
    startedBefore: Date
  ): Promise<TeamSnapEvent[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadEvents({
      sortStartDate: true,
      startedAfter: startedAfter.toISOString(),
      startedBefore: startedBefore.toISOString(),
      teamId,
    });
  },
  (teamId, startedAfter, startedBefore) =>
    [teamId, startedAfter, startedBefore].join(" ")
);
