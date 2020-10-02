import { AxiosInstance } from "axios";
import handleSingleItemTeamSnapResponse from "./handleSingleItemTeamSnapResponse";

export default async function loadSingleItem(
  client: AxiosInstance,
  url: string
) {
  return client.get(url).then(handleSingleItemTeamSnapResponse);
}
