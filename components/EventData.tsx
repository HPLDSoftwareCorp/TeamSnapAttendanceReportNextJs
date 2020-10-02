import React, { ChangeEventHandler, useState } from "react";
import {
  TeamSnapAvailability,
  TeamSnapContact,
  TeamSnapEvent,
  TeamSnapHealthCheckQuestionnaire,
  TeamSnapTeam,
} from "lib/client/teamsnap/TeamSnap";
import loadAvailabilities from "lib/client/teamsnap/loadAvailabilities";
import { useAsync } from "react-async";
import loadHealthCheckQuestionnaires from "lib/client/teamsnap/loadHealthCheckQuestionnaires";
import loadContacts from "lib/client/teamsnap/loadTeamContacts";
import formatTeamLabel from "lib/client/teamsnap/formatTeamLabel";
import styles from "styles/EventData.module.css";
import loadContactEmailAddressesForTeam from "lib/client/teamsnap/loadContactEmailAddressesForTeam";
import loadContactPhoneNumbersForTeam from "lib/client/teamsnap/loadContactPhoneNumbersForTeam";
import formatDate from "date-fns/format";
import loadMembers from "lib/client/teamsnap/loadMembers";
import fetchFormCheckins from "lib/client/fetchFormCheckins";

export interface EventDataProps {
  event: TeamSnapEvent;
  org: string;
  team: TeamSnapTeam;
  onlyAttendees: boolean;
}

let rsvpYesCheckmark = "\u2713";
let healthCheckVerifiedSymbol = "\u271A";
const formatAvailability = (
  a: TeamSnapAvailability,
  q: TeamSnapHealthCheckQuestionnaire
) =>
  [
    a?.statusCode === 1
      ? rsvpYesCheckmark
      : a?.statusCode === 0
      ? "\u2718"
      : "?",
    q?.status === "verified" && healthCheckVerifiedSymbol,
  ]
    .filter(Boolean)
    .join(" ") || "?";

export default function EventData({
  event,
  team,
  org,
  onlyAttendees,
}: EventDataProps) {
  let teamId = team.id;
  const notesKey = ["event", event.id, "notes"].join("-");
  const [notes, setNotes] = useState(sessionStorage[notesKey] || "");
  const onChangeNotes: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setNotes(e.target.value);
    sessionStorage[notesKey] = e.target.value;
  };
  const membersState = useAsync({ promise: loadMembers(teamId) });
  const members = membersState.data || [];
  const contactsState = useAsync({ promise: loadContacts(teamId) });
  const contacts = contactsState.data || [];
  const availabilitiesState = useAsync({
    promise: loadAvailabilities(event.id),
  });
  const availabilities = availabilitiesState.data || [];
  const phoneNumbersState = useAsync({
    promise: loadContactPhoneNumbersForTeam(teamId),
  });
  const emailAddressesState = useAsync({
    promise: loadContactEmailAddressesForTeam(teamId),
  });
  const hcqState = useAsync({
    promise: loadHealthCheckQuestionnaires(event),
  });
  const { isPending: checkinsPending, data: checkins = [] } = useAsync({
    promise: fetchFormCheckins(event.id, org),
    initialValue: [],
  });

  console.log({ checkins });
  const hcqs = hcqState.data || [];
  const pending: string[] = [];
  if (membersState.isPending) pending.push("members");
  if (contactsState.isPending) pending.push("contacts");
  if (availabilitiesState.isPending) pending.push("availabilities");
  if (hcqState.isPending) pending.push("health check questionnaires");
  if (phoneNumbersState.isPending) pending.push("phone numbers");
  if (emailAddressesState.isPending) pending.push("email addresses");
  if (checkinsPending) pending.push("non-TeamSnap checkins");
  if (pending.length) {
    return <div>Loading {pending.join(", ")} ...</div>;
  }
  const error =
    membersState.error ||
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
  const groupByMemberId = <T extends { memberId: number }>(
    elts: T[]
  ): Map<number, T[]> => {
    const result = new Map<number, T[]>();
    for (const elt of elts) {
      const group = result.get(elt.memberId);
      if (group) group.push(elt);
      else result.set(elt.memberId, [elt]);
    }
    return result;
  };
  const emailsMap = groupByMemberId(emailAddressesState.data || []);
  const phoneNumbersMap = groupByMemberId(phoneNumbersState.data || []);
  const hcqMap = new Map(
    hcqs.filter((q) => q.eventId === event.id).map((q) => [q.memberId, q])
  );
  const availabilityMap = new Map(availabilities.map((a) => [a.memberId, a]));
  const filteredMembers = onlyAttendees
    ? members.filter((member) => {
        let availability = availabilityMap.get(member.id);
        let hcq = hcqMap.get(member.id);
        let statusCode = availability?.statusCode;
        return (
          statusCode === 1 || (statusCode !== 0 && hcq?.status === "verified")
        );
      })
    : members;
  const contactMap = groupByMemberId(contacts);
  return (
    <div className={styles.container}>
      <table className={styles.attendees} cellPadding={0} cellSpacing={0}>
        <thead>
          <tr>
            <td colSpan={5}>
              <table className={styles.eventSummary}>
                <tbody>
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
                      {formatDate(event.startDate, "h:mm b")}
                      {event.endDate && (
                        <> to {formatDate(event.endDate, "h:mm b")}</>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <th>Team Member</th>
            <th>Parent/Contact</th>
            <th>Phone</th>
            <th>Email</th>
            <th>RSVP</th>
          </tr>
        </thead>
        <tbody>
          {(filteredMembers.length ? filteredMembers : members).map(
            (member) => {
              const availability = availabilityMap.get(member.id);
              const hcq = hcqMap.get(member.id);
              const contacts = contactMap.get(member.id) || [];
              const phoneNumbers = Array.from(
                new Set(
                  [
                    ...(member.phoneNumbers || []),
                    ...(phoneNumbersMap
                      .get(member.id)
                      ?.map((ph) => ph.phoneNumber) || []),
                  ].filter(Boolean)
                )
              ).sort();
              const emails = Array.from(
                new Set(
                  [
                    ...(member.emailAddresses || []),
                    ...(emailsMap.get(member.id)?.map((em) => em.email) || []),
                  ].filter(Boolean)
                )
              ).sort();
              return (
                <tr key={member.id}>
                  <td>
                    {member.firstName || ""} {member.lastName || ""}
                  </td>
                  <td>
                    {Array.from(
                      new Set(
                        contacts
                          .filter(
                            (contact) =>
                              contact.firstName !== member.firstName ||
                              contact.lastName !== member.lastName
                          )
                          .map((contact) =>
                            [
                              contact?.firstName || contact?.userFirstName,
                              contact?.lastName || contact?.userLastName,
                            ]
                              .filter(Boolean)
                              .join(" ")
                          )
                          .filter(Boolean)
                      )
                    ).join(", ")}
                  </td>
                  <td>{phoneNumbers.join(", ")}</td>
                  <td>{emails.join(", ")}</td>
                  <td>{formatAvailability(availability, hcq)} </td>
                </tr>
              );
            }
          )}
          {checkins.map((ci, n) => (
            <tr key={n}>
              <td>{ci.memberName}</td>
              <td>{ci.contactName}</td>
              <td>{ci.contactPhoneNumbers.join(", ")}</td>
              <td>{ci.contactEmails.join(", ")}</td>
              <td>{ci.passed ? <b>&#9745;</b> : <b>&#9888;</b>}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6} className={styles.notes}>
              <label>
                <div>Notes & Additional Contacts</div>
                <textarea onChange={onChangeNotes} value={notes} />
              </label>
              {!!notes.trim() && (
                <pre>
                  Notes & Additional Contacts:{"\n"}
                  {notes}
                </pre>
              )}
            </td>
          </tr>
        </tbody>
      </table>
      {onlyAttendees && filteredMembers.length < members.length && (
        <div style={{ textAlign: "center" }}>
          {filteredMembers.length} of {members.length} members
        </div>
      )}
    </div>
  );
}
