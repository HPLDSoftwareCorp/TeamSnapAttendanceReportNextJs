export interface LoadTeamsParams {
  userId: number;
}

export interface TeamSnapTeam {
  activePaymentProvider: unknown | null;
  activeSeasonTeamId: unknown | null;
  billedAt: Date;
  canExportMedia: boolean;
  createdAt: Date;
  defaultPaymentProvider: string;
  divisionId: number | null;
  divisionName: string;
  divisionRootId: number | null;
  hasExportableMedia: boolean;
  hasPlaayVideo: boolean;
  hasReachedMemberLimit: boolean;
  hasReachedRosterLimit: boolean;
  href: string;
  humanizedMediaStorageUsed: string;
  id: number;
  isArchivedSeason: number;
  isGameDay: number;
  isGatewayRequiredForSms: number;
  isHiddenOnDashboard: number;
  isInLeague: number;
  isRetired: number;
  lastAccessedAt: Date | null;
  leagueName: string;
  leagueUrl: string;
  links: object;
  locationCountry: string;
  locationLatitude: number | null;
  locationLongitude: number | null;
  locationPostalCode: string;
  locationState: string | null;
  mediaStorageUsed: number;
  memberLimit: number;
  name: string;
  nonPlayerMemberCount: number;
  planId: number;
  playerMemberCount: number;
  rosterLimit: number;
  seasonName: string;
  sportId: number;
  timeZone: string;
  timeZoneDescription: string;
  timeZoneIanaName: string;
  timeZoneOffset: string;
  type: string;
  updatedAt: Date;
}

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

  loadItems(
    key: "activeTeams",
    params: { userId: number }
  ): Promise<TeamSnapTeam[]>;
}

type LoadEventsParams = { teamId: number };

export interface TeamSnapEvent {
  additionalLocationDetails: unknown;
  arrivalDate: Date;
  createdAt: Date;
  divisionLocationId: number;
  doesntCountTowardsRecord: boolean;
  durationInMinutes: number;
  endDate: Date;
  formattedResults: unknown;
  formattedTitle: string;
  formattedTitleForMultiTeam: string;
  gameType: string;
  gameTypeCode: string | null;
  href: string;
  iconColor: string;
  id: number;
  isCanceled: boolean;
  isGame: boolean;
  isLeagueControlled: boolean;
  isOvertime: boolean;
  isShootout: boolean;
  isTbd: boolean;
  label: string | null;
  links: any;
  locationId: number | null;
  locationName: string;
  minutesToArriveEarly: number;
  name: string;
  notes: string | null;
  opponentId: number | null;
  opponentName: string | null;
  pointsForOpponent: number | null;
  pointsForTeam: number | null;
  repeatingType: unknown;
  repeatingTypeCode: unknown;
  repeatingUuid: string | null;
  results: unknown;
  resultsUrl: string | null;
  shootoutPointsForOpponent: number | null;
  shootoutPointsForTeam: number | null;
  sourceTimeZoneIanaName: string;
  startDate: Date;
  teamId: number;
  timeZone: string;
  timeZoneDescription: string;
  timeZoneIanaName: string;
  timeZoneOffset: string;
  tracksAvailability: boolean;
  type: string;
  uniform: unknown;
  updatedAt: Date;

  loadItems(
    link: "healthCheckQuestionnaires",
    params: LoadHealthCheckQuestionnairesParams
  ): Promise<TeamSnapHealthCheckQuestionnaire[]>;
}

export interface TeamSnapAvailability {
  createdAt: Date;
  eventId: number;
  href: string;
  id: string;
  isCurrentUser: boolean;
  links: any;
  memberId: number;
  notes: string;
  notesAuthorMemberId: number | null;
  status: string;
  statusCode: number;
  teamId: number;
  type: "availability";
  updatedAt: Date;
}

export interface TeamSnapHealthCheckQuestionnaire {
  createdAt: Date;
  eventId: number;
  href: string;
  id: string;
  links: any;
  memberId: number;
  status: "verified" | "unknown";
  type: "healthCheckQuestionnaire";
  updatedAt: Date;
}

export interface TeamSnapContact {
  addressCity: string;
  addressCountry: string;
  addressState: string;
  addressStreet1: string;
  addressStreet2: string;
  addressZip: string;
  allowSharedAccess: boolean;
  createdAt: Date;
  firstName: string;
  hideAddress: boolean;
  href: string;
  id: number;
  invitationCode: string;
  invitationDeclined: boolean | null;
  isAddressHidden: boolean;
  isAlertable: boolean;
  isCoach: boolean;
  isCommissioner: boolean;
  isEditable: boolean;
  isEmailable: boolean;
  isInvitable: boolean;
  isInvited: boolean | null;
  isManager: boolean;
  isOwner: boolean;
  isPushable: boolean;
  isSelectableForChat: boolean;
  isShownUnreachableForChatBanner: boolean;
  label: string | null;
  lastName: string;
  links: any;
  memberId: number;
  personUuid: string | null;
  teamId: number;
  type: "contact";
  updatedAt: Date;
  userFirstName: string | null;
  userId: number | null;
  userLastName: string | null;
}

export interface TeamSnapContactEmailAddress {
  contactId: number;
  createdAt: Date;
  email: string;
  href: string;
  id: number;
  invitationCode: string | null;
  invitationState: unknown | null;
  isAccepted: boolean;
  isHidden: boolean;
  isInvited: boolean;
  label: string | null;
  links: any;
  memberId: number;
  receivesTeamEmails: boolean;
  teamId: number;
  type: "contactEmailAddress";
  updatedAt: Date;
}

export interface TeamSnapContactPhoneNumber {
  contactId: number;
  createdAt: Date;
  href: string;
  id: number;
  isHidden: boolean;
  isPreferred: boolean;
  label: string | null;
  links: any;
  memberId: number;
  phoneNumber: string | null;
  preferred: boolean;
  smsEmailAddress: unknown | null;
  smsEnabled: boolean;
  smsGatewayId: unknown | null;
  teamId: string;
  type: "contactPhoneNumber";
  updatedAt: Date;
}

type LoadAvailabilitiesParams = { eventId: number };
type LoadHealthCheckQuestionnairesParams = { eventId: number };
type LoadContactEmailAddressesParams = { teamId: number };
type LoadContactPhoneNumbersParams = { teamId: number };

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

  loadActiveTeams(params: LoadTeamsParams): Promise<TeamSnapTeam[]>;
  loadAvailabilities(
    params: LoadAvailabilitiesParams
  ): Promise<TeamSnapAvailability[]>;
  loadContacts(params: { teamId: number }): Promise<TeamSnapContact[]>;
  loadEvents(params: LoadEventsParams): Promise<TeamSnapEvent[]>;
  loadHealthCheckQuestionnaires(
    params: LoadHealthCheckQuestionnairesParams
  ): Promise<TeamSnapHealthCheckQuestionnaire[]>;
  loadTeams(params: LoadTeamsParams): Promise<TeamSnapTeam[]>;

  loadContactEmailAddresses(
    params: LoadContactEmailAddressesParams
  ): TeamSnapContactEmailAddress[];
  loadContactPhoneNumbers(
    params: LoadContactPhoneNumbersParams
  ): TeamSnapContactPhoneNumber[];
}