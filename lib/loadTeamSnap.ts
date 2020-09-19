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
  auth(): TeamSnap;
  collections?: unknown;
  hasSession(): boolean;
  init(clientId): void;
  loadCollections(): void;
  startBrowserAuth(redirect: string, scopes: string[]);
  request?: (
    method: string,
    url: string,
    data: any,
    callback: (e: any, d: any) => void
  ) => void;
  loadMe(): Promise<TeamSnapUser>;
}

declare global {
  interface Window {
    teamsnap?: TeamSnap;
  }
}

const loadTeamSnap = async (): Promise<TeamSnap> => {
  if (!("teamsnap" in window)) {
    await import("teamsnap.js");
    console.log({ id: process.env.NEXT_PUBLIC_TEAMSNAP_CLIENT_ID });
    window.teamsnap.init(process.env.NEXT_PUBLIC_TEAMSNAP_CLIENT_ID);
  }
  const teamsnap = window.teamsnap;
  if (teamsnap.hasSession() && !window.teamsnap.request) {
    teamsnap.auth();
  }
  if (!teamsnap.collections) {
    await teamsnap.loadCollections();
  }
  return teamsnap;
};

export default loadTeamSnap;