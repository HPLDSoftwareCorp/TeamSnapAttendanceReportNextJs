import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapEvent } from "./TeamSnap";

export default memoize(
  async function loadEvents(teamId: number): Promise<TeamSnapEvent[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadEvents({ teamId });
  },
  (teamId) => String(teamId)
);
