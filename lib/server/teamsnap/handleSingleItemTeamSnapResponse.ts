import convertTeamSnapItemToObject from "./convertTeamSnapItemToObject";

export default function handleSingleItemTeamSnapResponse(res) {
  if (res.status !== 200)
    return Promise.reject("Credentials not accepted by TeamSnap API");
  return convertTeamSnapItemToObject(res.data?.collection?.items[0]);
}
