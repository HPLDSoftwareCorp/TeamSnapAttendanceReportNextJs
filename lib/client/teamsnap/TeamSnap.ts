export interface LoadTeamsParams {
  divisionId?: number;
  userId?: number;
}

export interface TeamSnapDivision {
  activeChildrenCount: number;
  activeDescendantsCount: number;
  activePaymentProvider: string;
  activeTeamsCount: number;
  allChildrenCount: number;
  allTeamsCount: number;
  billingAddress: string | null;
  businessType: string | null;
  country: string;
  createdAt: Date;
  defaultPaymentProvider: string | null;
  formattedPersistentUuid: string;
  href: string;
  id: number;
  isAncestorArchived: boolean;
  isAncestorDisabled: boolean;
  isArchived: boolean | null;
  isDeletable: boolean;
  isDisabled: boolean;
  isPubliclyAccessible: boolean;
  leagueName: string | null;
  leagueUrl: string;
  leftBoundary: number;
  links: any;
  locationCountry: string;
  name: string;
  parentDivisionName: string;
  parentId: number;
  persistentUuid: string;
  planId: number;
  postalCode: string;
  rightBoundary: number;
  rootId: number;
  seasonName: string;
  sportId: number;
  teamsInPlan: number;
  timeZone: string;
  timeZoneDescription: string;
  timeZoneIanaName: string;
  timeZoneOffset: string;
  type: "division";
  updatedAt: Date;
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

type LoadEventsParams = {
  sortStartDate?: boolean;
  startedAfter?: string;
  startedBefore?: string;
  teamId: number;
};

export interface TeamSnapEvent {
  additionalLocationDetails: unknown;
  arrivalDate?: Date | null;
  createdAt: Date;
  divisionLocationId: number;
  doesntCountTowardsRecord: boolean;
  durationInMinutes: number;
  endDate?: Date | null;
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
  startDate?: Date | null;
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

  loadItem(key: "member"): Promise<TeamSnapMember>;
}

export interface TeamSnapMember {
  addressCity: string;
  addressCountry: string;
  addressState: string;
  addressStreet1: string;
  addressStreet2: string;
  addressZip: string;
  birthday?: string | null;
  createdAt: Date;
  divisionId: number;
  emailAddresses?: string[] | null;
  firstName: string;
  gender: "Male" | "Female" | string;
  hasFacebookPostScoresEnabled: boolean;
  hideAddress: boolean;
  hideAge: boolean;
  href: string;
  id: number;
  invitationCode: null;
  invitationDeclined: null;
  isActivated: boolean;
  isAddressHidden: boolean;
  isAgeHidden: boolean;
  isAlertable: boolean;
  isCoach: boolean;
  isCommissioner: boolean;
  isDeletable: boolean;
  isEditable: boolean;
  isEmailable: boolean;
  isInvitable: boolean;
  isInvited: boolean;
  isLeagueOwner: boolean;
  isManager: boolean;
  isNonPlayer: boolean;
  isOwner: boolean;
  isOwnershipPending: unknown | null;
  isPending: boolean;
  isPushable: boolean;
  isSelectableForChat: boolean;
  isShownUnreachableForChatBanner: boolean;
  jerseyNumber: unknown | null;
  lastLoggedInAt: unknown | null;
  lastName: string;
  links: any;
  pendingDivisionId: unknown | null;
  pendingTeamId: unknown | null;
  personUuid: unknown | null;
  phoneNumbers?: string[] | null;
  position: "Defence";
  registrationFormId: number;
  roleUuid: unknown | null;
  sourceMemberId: number | null;
  teamId: number;
  type: "member";
  updatedAt: Date;
  userId: number;
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

export interface TeamSnapMemberPhoneNumber {
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

interface LoadAvailabilitiesParams {
  eventId: number;
}

interface LoadHealthCheckQuestionnairesParams {
  eventId: number;
}

interface LoadContactEmailAddressesParams {
  contactId?: number;
  teamId?: number;
}

interface LoadMemberEmailAddressesParams {
  teamId?: number;
  memberId?: number;
}

interface LoadContactPhoneNumbersParams {
  contactId?: number;
  teamId?: number;
}

interface LoadMembersParams {
  contactId?: number;
  teamId?: number;
  userId?: number;
}

interface LoadContactsParams {
  memberId?: number;
  teamId?: number;
  userId?: number;
}

export interface LoadDivisionsParams {}

export interface TeamSnap {
  browserLogout(): void;

  apiUrl: string;

  auth(): TeamSnap;

  collections?: unknown;

  hasSession(): boolean;

  init(clientId: string): void;

  isAuthed(): boolean;

  loadCollections(): void;

  startBrowserAuth(redirect: string, scopes: string[]): void;

  request?: {
    hook(f: (xhr: XMLHttpRequest, data: unknown) => void): void;
  };

  loadMe(): Promise<TeamSnapUser>;

  loadActiveTeams(params: LoadTeamsParams): Promise<TeamSnapTeam[]>;

  loadAvailabilities(
    params: LoadAvailabilitiesParams
  ): Promise<TeamSnapAvailability[]>;

  loadContacts(params: LoadContactsParams): Promise<TeamSnapContact[]>;

  loadDivisions(params?: LoadDivisionsParams): Promise<TeamSnapDivision[]>;

  loadEvents(params: LoadEventsParams): Promise<TeamSnapEvent[]>;

  loadHealthCheckQuestionnaires(
    params: LoadHealthCheckQuestionnairesParams
  ): Promise<TeamSnapHealthCheckQuestionnaire[]>;

  loadTeams(params: LoadTeamsParams): Promise<TeamSnapTeam[]>;

  loadMembers(params: LoadMembersParams): Promise<TeamSnapMember[]>;

  loadContactEmailAddresses(
    params: LoadContactEmailAddressesParams
  ): TeamSnapContactEmailAddress[];

  loadContactPhoneNumbers(
    params: LoadContactPhoneNumbersParams
  ): TeamSnapContactPhoneNumber[];

  loadMemberPhoneNumbers(
    params: LoadContactPhoneNumbersParams
  ): Promise<TeamSnapMemberPhoneNumber[]>;

  loadMemberEmailAddresses(param: LoadMemberEmailAddressesParams): [];
}

declare global {
  interface Window {
    teamsnap?: TeamSnap;
  }
}
