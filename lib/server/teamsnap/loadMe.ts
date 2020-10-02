import { AxiosInstance } from "axios";
import loadSingleItem from "./loadSingleItem";
import { TeamSnapUser } from "../../client/teamsnap/TeamSnap";

export default async function loadMe(
  client: AxiosInstance
): Promise<TeamSnapUser> {
  return loadSingleItem(client, "/v3/me");
}
