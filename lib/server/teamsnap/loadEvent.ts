import { AxiosInstance } from "axios";
import loadSingleItem from "./loadSingleItem";
import {TeamSnapEvent} from "../../client/teamsnap/TeamSnap";

export default async function loadEvent(
  client: AxiosInstance,
  eventId: number
): Promise<TeamSnapEvent> {
  return loadSingleItem(client, `/v3/events/${eventId}`);
}
