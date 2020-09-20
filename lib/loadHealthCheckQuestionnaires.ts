import loadTeamSnap from "./loadTeamSnap";
import memoize from "lodash/memoize";
import { TeamSnapEvent, TeamSnapHealthCheckQuestionnaire } from "./TeamSnap";

export default memoize(
  async function loadHealthCheckQuestionnaires(
    event: TeamSnapEvent
  ): Promise<TeamSnapHealthCheckQuestionnaire[]> {
    const teamsnap = await loadTeamSnap();
    if (!teamsnap.isAuthed()) {
      return [];
    }
    return event.loadItems("healthCheckQuestionnaires", { eventId: event.id });
  },
  ({ teamId }) => String(teamId)
);
