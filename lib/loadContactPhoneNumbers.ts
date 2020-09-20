import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapContactPhoneNumber } from "./TeamSnap";

export default memoize(
  async function loadContactPhoneNumbers(
    teamId: number
  ): Promise<TeamSnapContactPhoneNumber[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadContactPhoneNumbers({ teamId });
  },
  (teamId) => String(teamId)
);
