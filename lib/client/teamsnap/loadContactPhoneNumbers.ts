import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapContactPhoneNumber } from "./TeamSnap";

export default memoize(
  async function loadContactPhoneNumbers(
    contactId: number
  ): Promise<TeamSnapContactPhoneNumber[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadContactPhoneNumbers({ contactId });
  },
  (contactId) => String(contactId)
);
