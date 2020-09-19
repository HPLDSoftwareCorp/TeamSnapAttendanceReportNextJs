export interface TeamSnapUser {
  activeTeamsCount: number;
  addressCountry: string | null;
  addressState: string | null;
  birthday: string | null;
  canSendMessages: true;
  commissionedTeamIds: number[];
  createdAt: Date;
  email: string;
  facebookAccessToken: string | null;
  facebookId: string | null;
  firstName: string;
  highestRole: string;
  href: string;
  id: number;
  isAdmin: boolean;
  isEligibleForFreeTrial: boolean;
  isLabRat: boolean;
  lastName: string;
  links: unknown;
  managedDivisionIds: number[];
  managedDivisionsCount: 0;
  managedTeamIds: number[];
  ownedDivisionIds: number[];
  ownedTeamIds: number[];
  personUuid: string;
  receivesNewsletter: boolean;
  teamsCount: number;
  type: string;
  updatedAt: Date;
}

export interface TeamSnap {
  browserLogout();
  apiUrl: string;
  auth(): TeamSnap;
  collections?: unknown;
  hasSession(): boolean;
  init(clientId): void;
  isAuthed(): boolean;
  loadCollections(): void;
  startBrowserAuth(redirect: string, scopes: string[]);
  request?: {
    hook(f: (xhr: XMLHttpRequest, data: unknown) => void): void;
  };
  loadMe(): Promise<TeamSnapUser>;
}

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
    teamsnap.request = patchRequest(teamsnap.request);
  }
  if (teamsnap.request && !teamsnap.collections) {
    await teamsnap.loadCollections();
  }
  return teamsnap;
};

export default loadTeamSnap;
