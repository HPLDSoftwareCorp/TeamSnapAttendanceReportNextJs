import memoize from "lodash/memoize";
import unionBy from "lodash/unionBy";
import { TeamSnapEvent } from "./TeamSnap";
import loadEvents from "./loadEvents";
import sortBy from "lodash/sortBy";

export default memoize(
  async function loadEventsForTeams(
    teamIds: number[],
    startedAfter: Date,
    startedBefore: Date
  ): Promise<TeamSnapEvent[]> {
    const allEvents = await Promise.all(
      teamIds.map((teamId) => loadEvents(teamId, startedAfter, startedBefore))
    );
    return sortBy(
      allEvents.reduce((a, b) => unionBy(a, b, "id"), []),
      "startDate"
    );
  },
  (teamIds, startedAfter, startedBefore) =>
    [sortBy(teamIds).join(","), startedAfter, startedBefore].join(" ")
);
