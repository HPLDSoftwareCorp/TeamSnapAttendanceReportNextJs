export interface CheckinDoc {
  contactEmails: string[];
  contactName: string;
  contactPhoneNumbers: string[];
  eventDate: string;
  eventLocation: string;
  eventTime: string;
  eventTimestamp: string | Date;
  memberName: string;
  org: string;
  passed: boolean;
  teamSnapEventId?: number | null;
  teamSnapTeamId?: number | null;
  timestamp: Date | string;
}
