import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapMember } from "./TeamSnap";

export default memoize(
  async function loadMembers(teamId: number): Promise<TeamSnapMember[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadMembers({ teamId });
  },
  (teamId) => String(teamId)
);
