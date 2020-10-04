import React, { useState } from "react";
import { useAsync } from "react-async";
import {
  TeamSnapEvent,
  TeamSnapTeam,
  TeamSnapUser,
} from "lib/client/teamsnap/TeamSnap";
import loadMe from "lib/client/teamsnap/loadMe";
import loadActiveTeams from "lib/client/teamsnap/loadActiveTeams";
import { addHours, isSameDay, subHours } from "date-fns";
import styles from "styles/checkin.module.css";
import Head from "next/head";
import doLogout from "lib/client/teamsnap/doLogout";
import doLogin from "lib/client/teamsnap/doLogin";
import TopBar from "components/TopBar";
import ErrorBox from "components/ErrorBox";
import loadEventsForTeams from "../../lib/client/teamsnap/loadEventsForTeams";
import formatDate from "date-fns/format";
import parseDate from "date-fns/parse";
import loadMemberPhoneNumbers from "../../lib/client/teamsnap/loadMemberPhoneNumbers";
import loadTeamContactsForUser from "../../lib/client/teamsnap/loadTeamContactsForUser";
import { useRouter } from "next/router";
import YesNo from "../../components/YesNo";
import loadContactPhoneNumbers from "../../lib/client/teamsnap/loadContactPhoneNumbers";
import loadContactEmailAddresses from "../../lib/client/teamsnap/loadContactEmailAddresses";
import loadMemberEmailAddresses from "../../lib/client/teamsnap/loadMemberEmailAddresses";

const healthQuestionList = [
  <>
    <h3>
      Are you experiencing cold, flu or COVID-19-like symptoms, even mild ones,
      not explained by pre-existing conditions such as allergies or asthma?
    </h3>
    <p>
      Symptoms include: Fever*, chills, cough or worsening of chronic cough,
      shortness of breath, sore throat, runny nose, loss of sense of smell or
      taste, headache, fatigue, diarrhea, loss of appetite, nausea and vomiting,
      muscle aches. While less common, symptoms can also include: stuffy nose,
      conjunctivitis (pink eye), dizziness, confusion, abdominal pain, skin
      rashes or discoloration of fingers or toes.
    </p>
    <p>
      Fever: Average normal body temperature taken orally is about 37°C. For
      more on normal body temperature and fevers, see HealthLinkBC's information
      for children age 11 and younger and for people age 12 and older .
    </p>
  </>,
  <>
    <h3>
      Have you travelled to any countries outside Canada (including the United
      States) within the last 14 days for reasons that are not{" "}
      <a href="https://www.canada.ca/en/public-health/services/publications/diseases-conditions/covid-19-information-essential-service-workers.html">
        exempted from 14 day quarantine
      </a>
      ?
    </h3>
  </>,
  <>
    <h3>Have you been asked by public health to self-isolate?</h3>
  </>,
];

export default function Checkin() {
  const router = useRouter();
  const org = String(router.query.org);
  const lookAheadHours = Number(router.query.hours || 8);
  const lookBackHours = Number(router.query.hours || 1);
  const startDate = subHours(Date.now(), lookBackHours);
  const endDate = addHours(Date.now(), lookAheadHours);
  const userState = useAsync<TeamSnapUser | null>(loadMe);
  const user = userState.data;
  const teamsState = useAsync<TeamSnapTeam[]>({
    promise: user && loadActiveTeams(user),
  });
  const [teamSnapEvent, setTeamSnapEvent] = useState<TeamSnapEvent | null>(
    null
  );
  const locationParam = String(router.query.location || "");
  const [eventLocationState, setEventLocation] = useState<string>(
    locationParam
  );
  const eventLocation = locationParam || eventLocationState;
  const [eventDate, setEventDate] = useState<string>(
    formatDate(new Date(), "yyyy-MM-dd")
  );
  const [eventTime, setEventTime] = useState<string>("");
  const [memberName, setMemberName] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactPhoneNumber, setContactPhoneNumber] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [healthAnswers, setHealthAnswers] = useState<
    Array<boolean | null | undefined>
  >(new Array(healthQuestionList.length));
  const [submittedAt, setSubmittedAt] = useState<Date | null>(null);

  const setHealthAnswer = (n: number, ans: boolean) => {
    const newAnswers = [...healthAnswers];
    newAnswers[n] = ans;
    setHealthAnswers(newAnswers);
  };

  const activeTeams = teamsState.data || [];
  const eventsState = useAsync<TeamSnapEvent[]>({
    promise: loadEventsForTeams(
      activeTeams.map((t) => t.id),
      startDate,
      endDate
    ),
    initialValue: [],
  });
  const leagues = Array.from(
    new Set(activeTeams.map((t) => t.leagueName))
  ).filter(Boolean);

  const events = locationParam
    ? eventsState.data.filter(
        (e) => e.locationName.toLowerCase() === locationParam.toLowerCase()
      )
    : eventsState.data;

  const eventTimestamp = parseDate(
    [eventDate, eventTime].join(" "),
    "yyyy-MM-dd HH:mm",
    new Date()
  );

  const addCheckin = () => {
    console.log(
      { eventDate, eventTime, eventTimestamp },
      [eventDate, eventTime].join(" "),
      "yyyy-MM-dd HH:mm"
    );
    return fetch("/api/checkin", {
      method: "post",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        memberName,
        contactName,
        contactPhoneNumbers: contactPhoneNumber
          .split(/\s*,\s*/)
          .filter(Boolean),
        contactEmails: contactEmail.split(/\s*,\s*/).filter(Boolean),
        eventLocation,
        eventDate,
        eventTime,
        eventTimestamp: eventTimestamp.toISOString(),
        org,
        passed: !healthAnswers.some((a) => a !== false),
        teamSnapEventId: teamSnapEvent?.id,
        teamSnapTeamId: teamSnapEvent?.teamId,
        timestamp: new Date().toISOString(),
      }),
    });
  };

  const onClickSubmit = async () => {
    if (!eventLocation) {
      alert("Please enter the location of the event");
    } else if (!eventTime) {
      alert("Please enter the time of the event");
    } else if (!eventDate) {
      alert("Please enter the date of the event");
    } else if (!contactPhoneNumber) {
      alert("Please provide a contact phone number");
    } else if (!memberName) {
      alert("Please provide the names of the persons attending the event");
    } else if (eventTimestamp < startDate) {
      alert("That event is too far in the past");
    } else if (eventTimestamp > endDate) {
      alert(
        `That event is too far in the future, please try again after ${subHours(
          eventTimestamp,
          lookAheadHours
        ).toLocaleString()}`
      );
    } else {
      // TODO: Save submission data for later lookup!
      const timestamp = new Date();

      await addCheckin().then(
        () => setSubmittedAt(timestamp),
        (e) => {
          console.error(e);
          alert(
            "There was a problem saving your submission.\nPlease try again or work with the health person to find another way."
          );
        }
      );
    }
  };

  const onClickTeamSnapEvent = (evt: TeamSnapEvent) => {
    setTeamSnapEvent(evt);
    setEventLocation(evt.locationName);
    setEventDate(formatDate(evt.startDate, "yyyy-MM-dd"));
    setEventTime(formatDate(evt.startDate, "HH:mm"));
    loadTeamContactsForUser(evt.teamId, user.id).then(async (contacts) => {
      const members = await Promise.all(
        contacts.map((c) => c.loadItem("member"))
      );
      setContactName(
        Array.from(
          new Set(
            contacts.map((c) =>
              [c.firstName, c.lastName].filter(Boolean).join(" ")
            )
          )
        ).join(", ")
      );
      setMemberName(
        Array.from(
          new Set(
            members.map((c) =>
              [c.firstName, c.lastName].filter(Boolean).join(" ")
            )
          )
        ).join(", ")
      );
      const emails = Array.from(
        new Set(
          Array.from(
            await Promise.all([
              ...contacts.map((c) => loadContactEmailAddresses(c.id)),
              ...members.map((m) => loadMemberEmailAddresses(m.id)),
            ])
          )
            .map((addrs) => addrs.map((em) => em.email).join(", "))
            .filter(Boolean)
        )
      ).join(", ");
      if (emails) {
        setContactEmail(emails);
      }
      const phones = Array.from(
        new Set(
          Array.from(
            await Promise.all([
              ...contacts.map(async (c) => await loadContactPhoneNumbers(c.id)),
              ...members.map(async (m) => await loadMemberPhoneNumbers(m.id)),
            ])
          )
            .map((phones) => phones.map((ph) => ph.phoneNumber).join(", "))
            .filter(Boolean)
        )
      ).join(", ");
      if (phones) {
        setContactPhoneNumber(phones);
      }
    });
  };

  const renderSummary = () => (
    <>
      <h2>{memberName}</h2>
      <h2>
        {eventDate} {eventTime}
      </h2>
      <h3>{eventLocation}</h3>
      <p>Form Filled At {submittedAt.toLocaleString()}</p>
    </>
  );

  const renderTeamSnapEventPicker = function () {
    return userState.isPending ? (
      <>Loading...</>
    ) : userState.error ? (
      ErrorBox({ error: userState.error })
    ) : user ? (
      teamsState.isPending ? (
        <>Loading teams...</>
      ) : teamsState.error ? (
        ErrorBox({ error: teamsState.error })
      ) : eventsState.isPending ? (
        <>Loading events...</>
      ) : eventsState.error ? (
        ErrorBox({ error: eventsState.error })
      ) : !events.length ? (
        <>
          <h3>Your Upcoming Events</h3>
          <p>
            Sorry, we didn't find any events within {lookAheadHours} hours in
            your TeamSnap account. Please fill in the form manually.
          </p>
        </>
      ) : (
        <>
          <h3>Your Upcoming Events</h3>
          <p>
            Click the an event to use the location, time, and contact
            information from TeamSnap for that event to fill the first fields of
            the form.
          </p>
          <table className={styles.eventPickerTable}>
            <thead>
              <tr>
                <th>&nbsp;</th>
                <th>Team</th>
                <th>Location</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => {
                const team = activeTeams.find((t) => t.id === evt.teamId);

                const eltId = ["pick-event", evt.id].join("-");
                return (
                  <tr key={evt.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={teamSnapEvent?.id === evt.id}
                        id={eltId}
                        onChange={() => onClickTeamSnapEvent(evt)}
                        value={evt.id}
                      />
                    </td>
                    <td>
                      <label htmlFor={eltId}>{team.name}</label>
                    </td>
                    <td>
                      <label htmlFor={eltId}>{evt.locationName}</label>
                    </td>
                    <td>
                      <label htmlFor={eltId}>
                        {formatDate(
                          evt.startDate,
                          isSameDay(evt.startDate, Date.now())
                            ? "h:mm b"
                            : "yyyy-MM-dd h:mm b"
                        )}
                        {evt.endDate && (
                          <> to {formatDate(evt.endDate, "h:mm b")}</>
                        )}
                      </label>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )
    ) : (
      <div>
        <p>
          Click this to get your event & contact information from TeamSnap
          instead of entering it manually:
        </p>
        <div>
          <button onClick={() => doLogin().then(() => userState.reload())}>
            Log In Using TeamSnap
          </button>
        </div>
      </div>
    );
  };
  let renderOutcome = function () {
    return healthAnswers.some((ans) => ans !== false) ? (
      <div className={styles.healthCheckNoPass}>
        <h1>&#9888;</h1>
        <h2>Stay Home</h2>
        {renderSummary()}
      </div>
    ) : (
      <>
        <div className={styles.healthCheckPass}>
          <h1>&#9745;</h1>
          <h2>Health Check Passed</h2>
          {renderSummary()}
        </div>
        <p>
          Keep this page open on your phone to show at the door. If you close it
          accidentally you can always fill in the form again.
        </p>
      </>
    );
  };
  if (submittedAt) {
    return (
      <div className={styles.container}>
        <Head>
          <title>
            Event Check-in - {leagues.length === 1 ? leagues[0] + " - " : ""}
            {formatDate(startDate, "yyyy-MM-dd")}
          </title>
        </Head>
        <main className={styles.main}>{renderOutcome()}</main>
      </div>
    );
  }
  return (
    <div className={styles.container}>
      <Head>
        <title>
          Event Check-in - {leagues.length === 1 ? leagues[0] + " - " : ""}
          {formatDate(startDate, "yyyy-MM-dd")}
        </title>
      </Head>
      <TopBar
        title="Contact Tracing"
        user={user}
        onClickLogout={() => doLogout().then(() => userState.reload())}
      />
      <main className={styles.main}>
        <>
          <h1>Event Check-in</h1>
          {renderTeamSnapEventPicker()}

          <label className={styles.field}>
            Location
            <input
              disabled={!!(teamSnapEvent || locationParam)}
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            Date
            <input
              disabled={!!teamSnapEvent}
              min={formatDate(startDate, "yyyy-MM-dd")}
              max={formatDate(endDate, "yyyy-MM-dd")}
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
            <p>e.g. {formatDate(new Date(), "yyyy-MM-dd")}</p>
          </label>
          <label>
            Event Start Time
            <input
              disabled={!!teamSnapEvent}
              id="time-input"
              type="time"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
            />
            <p>e.g. {formatDate(new Date(), "HH:mm b")}</p>
          </label>
          {eventTimestamp > endDate ? (
            <p className={styles.dateWarning}>
              You can only use this form to check into an event less than{" "}
              {lookAheadHours} hours in the future
            </p>
          ) : eventTimestamp < startDate ? (
            <p className={styles.dateWarning}>
              You can only use this form to check into an event less than{" "}
              {lookBackHours} hours in the past
            </p>
          ) : null}
          <label className={styles.field}>
            Player Full Name
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            Parent / Emergency Contact Name
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />
          </label>
          <label className={styles.field}>
            Contact phone number(s)
            <input
              value={contactPhoneNumber}
              onChange={(e) => setContactPhoneNumber(e.target.value)}
            />
            <p>
              e.g. <i>778-123-4567, 604-299-2999</i>
            </p>
          </label>
          <label className={styles.field}>
            Contact email address(es)
            <input
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <p>
              e.g. <i>hector@example.org, maria@example.org</i>
            </p>
          </label>
          {healthQuestionList.map((q, n) => (
            <div key={`question-${n}`} className={styles.healthQuestion}>
              {q}
              <YesNo
                value={healthAnswers[n]}
                onChange={(e) => setHealthAnswer(n, e.target.value === "true")}
              />
            </div>
          ))}
          <div className={styles.formEnd}>
            <button onClick={onClickSubmit}>Submit</button>
          </div>
        </>
      </main>

      <footer className={styles.footer}>
        Copyright &copy; 2020 HPLD Software Corp., All Rights Reserved.{" - "}
        <a href="mailto:Dobes Vandermeer <info@hpld.co>">
          Email Us
        </a>
      </footer>
    </div>
  );
}
