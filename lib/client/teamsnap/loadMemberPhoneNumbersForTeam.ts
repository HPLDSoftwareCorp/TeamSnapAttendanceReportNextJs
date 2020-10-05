import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapMemberPhoneNumber } from "./TeamSnap";

export default memoize(
  async function loadMemberPhoneNumbers(
    teamId: number
  ): Promise<TeamSnapMemberPhoneNumber[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadMemberPhoneNumbers({ teamId });
  },
  (teamId) => String(teamId)
);
