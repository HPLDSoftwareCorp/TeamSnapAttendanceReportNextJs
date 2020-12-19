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
    const result = [];
    for (const division of activeDivisions) {
      if (division.activeTeamsCount) {
        result.push(division);
      }
      if (division.activeDescendantsCount) {
        const descendants = await division.loadItems("descendants");
        for (const descendant of descendants) {
          if (!descendant.isDisabled && !descendant.isArchived) {
            activeDivisions.push(descendant);
          }
        }
      }
    }

    return sortBy(result, "name", "id");
  },
  (user) => String(user?.id)
);
