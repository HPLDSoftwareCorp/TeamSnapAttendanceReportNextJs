import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapContactEmailAddress } from "./TeamSnap";

export default memoize(
  async function loadContactEmailAddresses(
    contactId: number
  ): Promise<TeamSnapContactEmailAddress[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadContactEmailAddresses({ contactId });
  },
  (contactId) => String(contactId)
);
