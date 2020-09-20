import loadTeamSnap from "./loadTeamSnap";
import { LoadTeamsParams, TeamSnapTeam, TeamSnapUser } from "./TeamSnap";
import memoize from "lodash/memoize";

export default memoize(
  async function loadActiveTeams(user: TeamSnapUser): Promise<TeamSnapTeam[]> {
    if (!user) {
      return [];
    }
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    const activeTeams = await user.loadItems("activeTeams", {
      userId: user.id,
    });
    return activeTeams;
  },
  (user) => String(user?.id)
);
