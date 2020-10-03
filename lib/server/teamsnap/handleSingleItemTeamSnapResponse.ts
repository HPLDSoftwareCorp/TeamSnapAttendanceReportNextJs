import convertTeamSnapItemToObject from "./convertTeamSnapItemToObject";
import { AxiosResponse } from "axios";

export default function handleSingleItemTeamSnapResponse(res: AxiosResponse) {
  if (res.status !== 200)
    return Promise.reject("Credentials not accepted by TeamSnap API");
  return convertTeamSnapItemToObject(res.data?.collection?.items[0]);
}
