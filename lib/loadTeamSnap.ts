import { TeamSnap } from "./TeamSnap";

declare global {
  interface Window {
    teamsnap?: TeamSnap;
  }
  interface XmlHttpRequest {
    data?: object;
  }
}

const patchUrl = (url: string) => {
  const parsed = new URL(url);
  if (parsed.protocol !== location.protocol || parsed.host !== location.host) {
    parsed.protocol = location.protocol;
    parsed.pathname = [
      "/api/proxy/",
      parsed.hostname,
      parsed.pathname === "/" ? "" : parsed.pathname,
    ].join("");
    parsed.host = location.host;
    return parsed.toString();
  }
  return url;
};
const patchRequest = (baseRequest: any) => {
  if ("baseRequest" in baseRequest) {
    // Already patched this one
    return baseRequest;
  }
  const request: any = (
    method: string,
    url: string,
    data: any,
    callback: (e: any, d: any) => void
  ) => baseRequest(method, patchUrl(url), data, callback);
  for (const method of ["get", "post", "put", "delete"]) {
    request[method] = (
      url: string,
      data: any,
      callback: (e: any, d: any) => void
    ) => baseRequest[method](patchUrl(url), data, callback);
  }
  request.baseRequest = baseRequest;
  request.create = () => patchRequest(baseRequest.create());
  request.clone = () => patchRequest(baseRequest.clone());
  request.hook = baseRequest.hook.bind(baseRequest);
  request.removeHook = baseRequest.removeHook.bind(baseRequest);
  return request;
};

const loadTeamSnap = async (): Promise<TeamSnap> => {
  if (!("teamsnap" in window)) {
    await import("teamsnap.js");
    window.teamsnap.init(process.env.NEXT_PUBLIC_TEAMSNAP_CLIENT_ID);
  }
  const teamsnap = window.teamsnap;
  if (teamsnap.hasSession() && !teamsnap.isAuthed()) {
    teamsnap.apiUrl = patchUrl(teamsnap.apiUrl);
    teamsnap.auth();
  }
  if (teamsnap.isAuthed()) {
    teamsnap.request = patchRequest(teamsnap.request);
  }
  if (teamsnap.request && !teamsnap.collections) {
    await teamsnap.loadCollections();
  }
  return teamsnap;
};

export default loadTeamSnap;
