import sortBy from "lodash/sortBy";
import unionBy from "lodash/unionBy";
import loadDivisionTeams from "./loadDivisionTeams";
import memoize from "lodash/memoize";

export default memoize(async function loadTeamsForDivisions(
  divisionIds: number[]
) {
  const allTeams = await Promise.all(
    divisionIds.map((divisionId: number) => loadDivisionTeams(divisionId))
  );
  return sortBy(
    allTeams.reduce((a, b) => unionBy(a, b, "id"), []),
    "name"
  );
});
