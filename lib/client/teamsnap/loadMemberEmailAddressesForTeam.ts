import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapContactEmailAddress } from "./TeamSnap";

export default memoize(
  async function loadMemberEmailAddresses(
    teamId: number
  ): Promise<TeamSnapContactEmailAddress[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadMemberEmailAddresses({ teamId });
  },
  (teamId) => String(teamId)
);
