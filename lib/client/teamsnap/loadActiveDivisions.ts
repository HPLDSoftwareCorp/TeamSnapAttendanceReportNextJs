import loadTeamSnap from "./loadTeamSnap";
import { TeamSnapDivision, TeamSnapUser } from "./TeamSnap";
import memoize from "lodash/memoize";
import sortBy from "lodash/sortBy";

export default memoize(
  async function loadActiveDivisions(
    user: TeamSnapUser
  ): Promise<TeamSnapDivision[]> {
    if (!user) {
      return [];
    }
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    const activeDivisions = await user.loadItems("activeDivisions", {
      userId: user.id,
    });
    return sortBy(activeDivisions, 'name', 'id');
  },
  (user) => String(user?.id)
);
