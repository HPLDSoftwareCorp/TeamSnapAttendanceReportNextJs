import loadTeamSnap from "./loadTeamSnap";
import { TeamSnapDivision } from "./TeamSnap";
import memoize from "lodash/memoize";

export default memoize(async function loadDivisions(): Promise<
  TeamSnapDivision[]
> {
  const teamsnap = await loadTeamSnap();
  if (!teamsnap.isAuthed()) {
    return [];
  }
  return teamsnap.loadDivisions();
});
