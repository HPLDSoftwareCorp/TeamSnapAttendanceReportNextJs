import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapAvailability } from "./TeamSnap";

export default memoize(
  async function loadAvailabilities(eventId: number): Promise<TeamSnapAvailability[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadAvailabilities({ eventId });
  },
  (teamId) => String(teamId)
);
