import axios, { AxiosInstance } from "axios";

export default function createTeamSnapClient(authToken: string): AxiosInstance {
  return axios.create({
    baseURL: "https://apiv3.teamsnap.com",
    headers: {
      accept: "application/json",
      authorization: ["Bearer", authToken].join(" "),
    },
  });
}
