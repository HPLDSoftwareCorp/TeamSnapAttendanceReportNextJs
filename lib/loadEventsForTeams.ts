import memoize from "lodash/memoize";
import unionBy from "lodash/unionBy";
import { TeamSnapEvent } from "./TeamSnap";
import loadEvents from "./loadEvents";
import sortBy from "lodash/sortBy";

export default memoize(
  async function loadEventsForAllTeams(
    teamIds: number[]
  ): Promise<TeamSnapEvent[]> {
    const allEvents = await Promise.all(
      teamIds.map((teamId) => loadEvents(teamId))
    );
    console.log("loadEventsForTeams", teamIds, allEvents);
    return sortBy(
      allEvents.reduce((a, b) => unionBy(a, b, "id"), []),
      "startDate"
    );
  },
  (teamIds) => sortBy(teamIds).join(",")
);
