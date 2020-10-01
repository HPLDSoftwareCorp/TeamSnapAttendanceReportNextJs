import memoize from "lodash/memoize";
import { TeamSnapContact } from "./TeamSnap";
import loadTeamSnap from "./loadTeamSnap";

export default memoize(
  async function loadTeamContactsForUser(
    teamId: number,
    userId: number
  ): Promise<TeamSnapContact[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadContacts({ teamId, userId });
  },
  (teamId: number, userId: number) => [teamId, userId].join()
);
