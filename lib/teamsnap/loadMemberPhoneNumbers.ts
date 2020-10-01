import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapMemberPhoneNumber } from "./TeamSnap";

export default memoize(
  async function loadMemberPhoneNumbers(
    memberId: number
  ): Promise<TeamSnapMemberPhoneNumber[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return teamsnap.loadMemberPhoneNumbers({ memberId });
  },
  (memberId) => String(memberId)
);
