import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapContact } from "./TeamSnap";

export default memoize(
  async function loadContacts(teamId: number): Promise<TeamSnapContact[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadContacts({ teamId });
  },
  (teamId) => String(teamId)
);
