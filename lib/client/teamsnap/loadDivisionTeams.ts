import loadTeamSnap from "./loadTeamSnap";
import { LoadTeamsParams, TeamSnapTeam, TeamSnapUser } from "./TeamSnap";
import memoize from "lodash/memoize";

export default memoize(
  async function loadDivisionTeams(
    divisionId: number
  ): Promise<TeamSnapTeam[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadTeams({ divisionId });
  },
  (divisionId) => String(divisionId)
);
