import React from "react";
import { TeamSnapEvent, TeamSnapTeam } from "../lib/TeamSnap";
import loadAvailabilities from "../lib/loadAvailabilities";
import { useAsync } from "react-async";
import loadHealthCheckQuestionnaires from "../lib/loadHealthCheckQuestionnaires";
import loadContacts from "../lib/loadContacts";
import formatTeamLabel from "../lib/formatTeamLabel";
import styles from "styles/EventData.module.css";
import loadContactEmailAddresses from "../lib/loadContactEmailAddresses";
import loadContactPhoneNumbers from "../lib/loadContactPhoneNumbers";
import formatDate from "date-fns/format";

export interface EventDataProps {
  event: TeamSnapEvent;
  team: TeamSnapTeam;
}

export default function EventData({ event, team }: EventDataProps) {
  let teamId = team.id;
  const contactsState = useAsync({ promise: loadContacts(teamId) });
  const contacts = contactsState.data || [];
  const availabilitiesState = useAsync({
    promise: loadAvailabilities(event.id),
  });
  const availabilities = availabilitiesState.data || [];
  const phoneNumbersState = useAsync({
    promise: loadContactPhoneNumbers(teamId),
  });
  const emailAddressesState = useAsync({
    promise: loadContactEmailAddresses(teamId),
  });
  const hcqState = useAsync({
    promise: loadHealthCheckQuestionnaires(event),
  });
  const hcqs = hcqState.data || [];
  const pending: string[] = [];
  if (contactsState.isPending) pending.push("contacts");
  if (availabilitiesState.isPending) pending.push("availabilities");
  if (hcqState.isPending) pending.push("health check questionnaires");
  if (phoneNumbersState.isPending) pending.push("phone numbers");
  if (emailAddressesState.isPending) pending.push("email addresses");
  if (pending.length) {
    return <>Loading {pending.join(", ")} ...</>;
  }
  const error =
    contactsState.error ||
    availabilitiesState.error ||
    hcqState.error ||
    phoneNumbersState.error ||
    emailAddressesState.error;
  if (error) {
    return (
      <div>
        <h3>Failed to Get Attendance Data</h3>
        {error.message || String(error)}
        <pre>{error.stack}</pre>
      </div>
    );
  }
  const contactsMap = new Map(contacts.map((c) => [c.memberId, c]));
  const emailsMap = new Map<number, string>(
    (emailAddressesState.data || []).map((ea) => [ea.memberId, ea.email])
  );
  const phoneNumbersMap = new Map<number, string>(
    (phoneNumbersState.data || []).map((pn) => [pn.memberId, pn.phoneNumber])
  );
  const availabilityMap = new Map(availabilities.map((a) => [a.memberId, a]));
  const hcqMap = new Map(hcqs.map((q) => [q.memberId, q]));
  const attendees = contacts.filter(
    (c) => availabilityMap.get(c.memberId)?.statusCode === 1
  );

  console.log({
    event,
    team,
    availabilities,
    contacts,
    phoneNumbers: phoneNumbersState.data,
    emails: emailAddressesState.data,
  });

  return (
    <div className={styles.container}>
      <table className={styles.attendees} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr>
            <td colSpan={4}>
              <table className={styles.eventSummary}>
                <tr>
                  <th>Location</th>
                  <td>{event.locationName}</td>
                  <th>Team</th>
                  <td colSpan={3}>{formatTeamLabel(team)}</td>
                </tr>
                <tr>
                  <th>Date</th>
                  <td>{event.startDate.toLocaleDateString()}</td>
                  <th>Time</th>
                  <td>
                    {formatDate(event.startDate, "h:mm b")} to{" "}
                    {formatDate(event.endDate, "h:mm b")}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {attendees.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.firstName || contact.userFirstName || ""}</td>
              <td>{contact.lastName || contact.userLastName || ""}</td>
              <td>{phoneNumbersMap.get(contact.memberId)}</td>
              <td>{emailsMap.get(contact.memberId)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
