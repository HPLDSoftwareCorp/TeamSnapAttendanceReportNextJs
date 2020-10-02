import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";

export default memoize(
  async function loadMe() {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) return null;
    return teamsnap.loadMe();
  },
  () => sessionStorage["teamsnap.authToken"]
);
