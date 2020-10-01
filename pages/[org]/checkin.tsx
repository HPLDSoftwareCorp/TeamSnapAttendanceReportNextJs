import React, { ChangeEventHandler, useState } from "react";
import { useAsync } from "react-async";
import {
  TeamSnapEvent,
  TeamSnapTeam,
  TeamSnapUser,
} from "lib/teamsnap/TeamSnap";
import loadMe from "lib/teamsnap/loadMe";
import loadActiveTeams from "lib/teamsnap/loadActiveTeams";
import {
  addHours,
  addMinutes,
  isSameDay,
  roundToNearestMinutes,
  subHours,
} from "date-fns";
import styles from "styles/checkin.module.css";
import Head from "next/head";
import doLogout from "lib/teamsnap/doLogout";
import doLogin from "lib/teamsnap/doLogin";
import TopBar from "components/TopBar";
import ErrorBox from "components/ErrorBox";
import loadEventsForTeams from "../../lib/teamsnap/loadEventsForTeams";
import formatDate from "date-fns/format";
import loadMemberPhoneNumbers from "../../lib/teamsnap/loadMemberPhoneNumbers";
import loadTeamContactsForUser from "../../lib/teamsnap/loadTeamContactsForUser";
import { useRouter } from "next/router";
import YesNo from "../../components/YesNo";
import loadContactPhoneNumbers from "../../lib/teamsnap/loadContactPhoneNumbers";
import loadContactEmailAddresses from "../../lib/teamsnap/loadContactEmailAddresses";
import loadMemberEmailAddresses from "../../lib/teamsnap/loadMemberEmailAddresses";

const healthQuestionList = [
  <>
    <h3>
      Are you experiencing cold, flu or COVID-19-like symptoms, even mild ones?
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
  const lookAheadHours = Number(router.query.hours || 8);
  const startDate = roundToNearestMinutes(subHours(Date.now(), 1), {
    nearestTo: 30,
  });
  const endDate = roundToNearestMinutes(addHours(Date.now(), lookAheadHours), {
    nearestTo: 30,
  });
  const userState = useAsync<TeamSnapUser | null>(loadMe);
  const user = userState.data;
  const teamsState = useAsync<TeamSnapTeam[]>({
    promise: user && loadActiveTeams(user),
  });
  const [eventId, setEventId] = useState<number | null>(null);
  const [eventLocation, setEventLocation] = useState<string>("");
  const [eventDate, setEventDate] = useState<string>(
    formatDate(new Date(), "yyyy-MM-dd")
  );
  const [eventTime, setEventTime] = useState<string>("");
  const [attendeeNames, setAttendeeNames] = useState<string>("");
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
  });
  const leagues = Array.from(
    new Set(activeTeams.map((t) => t.leagueName))
  ).filter(Boolean);

  const events = eventsState.data || [];

  const quickUpcomingIceTimes = [];
  for (
    let time = roundToNearestMinutes(new Date(), { nearestTo: 15 });
    time < endDate && quickUpcomingIceTimes.length < 8;
    time = addMinutes(time, 15)
  ) {
    quickUpcomingIceTimes.push(formatDate(time, "HH:mm"));
  }

  const onClickSubmit = async () => {
    if (!eventLocation) {
      alert("Please enter the location of the event");
    } else if (!eventTime) {
      alert("Please enter the time of the event");
    } else if (!eventDate) {
      alert("Please enter the date of the event");
    } else if (!contactPhoneNumber) {
      alert("Please provide a contact phone number");
    } else if (!attendeeNames) {
      alert("Please provide the names of the persons attending the event");
    } else {
      // TODO: Save submission data for later lookup!
      setSubmittedAt(new Date());
      let formUrl = process.env.NEXT_PUBLIC_SUBMISSIONS_GOOGLE_FORM_URL;
      if (formUrl) {
        const parsed = new URL(formUrl);
        parsed.protocol = location.protocol;
        parsed.pathname = [
          "/api/proxy/",
          parsed.hostname,
          parsed.pathname.replace("/viewform", "/formResponse"),
        ].join("");
        parsed.host = location.host;
        const qs = parsed.searchParams;
        const subs = {
          attendeeNames,
          contactPhoneNumber,
          contactEmail,
          eventLocation,
          eventDate,
          eventTime,
          pass: healthAnswers.some((a) => a !== false) ? "Fail" : "Pass",
        };
        for (const [k, v] of Array.from(qs.entries())) {
          const sub = subs[v];
          if (sub) {
            qs.set(k, sub);
          }
        }
        qs.set("submit", "Submit");
        console.log(parsed.toString());
        fetch(parsed.toString()).catch((e) => {
          console.error(e);
          alert(
            "There was a problem saving your contact information to Google Sheets.  Please try again."
          );
        });
      }
    }
  };

  const onClickTeamSnapEvent = (evt: TeamSnapEvent) => {
    setEventId(evt.id);
    setEventLocation(evt.locationName);
    setEventDate(formatDate(evt.startDate, "yyyy-MM-dd"));
    setEventTime(formatDate(evt.startDate, "HH:mm"));
    loadTeamContactsForUser(evt.teamId, user.id).then(async (contacts) => {
      const members = await Promise.all(
        contacts.map((c) => c.loadItem("member"))
      );
      setAttendeeNames(
        Array.from(
          new Set(
            [...contacts, ...members, user].map((c) =>
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
      <h2>{attendeeNames}</h2>
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
        <p>
          Sorry, we didn't find any events coming up in your TeamSnap account.
          You'll have to fill in the form manually.
        </p>
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
                        checked={eventId === evt.id}
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
        <h2>Check with the health person for instructions</h2>
        {renderSummary()}
      </div>
    ) : (
      <div className={styles.healthCheckPass}>
        <h1>&#9745;</h1>
        <h2>Proceed to your event</h2>
        {renderSummary()}
      </div>
    );
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>
          Event Check-in - {leagues.length === 1 ? leagues[0] + " - " : ""}
          {formatDate(startDate, "yyyy-MM-dd")}
        </title>
      </Head>

      <main className={styles.main}>
        <TopBar
          title="Contact Tracing"
          user={user}
          onClickLogout={() => doLogout().then(() => userState.reload())}
        />
        <h1>Event Check-in</h1>
        {submittedAt ? (
          renderOutcome()
        ) : (
          <>
            {renderTeamSnapEventPicker()}

            <label className={styles.field}>
              Location
              <input
                disabled={!!eventId}
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              Date
              <input
                disabled={!!eventId}
                min={formatDate(startDate, "yyyy-MM-dd")}
                max={formatDate(endDate, "yyyy-MM-dd")}
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </label>
            <div className={styles.field}>
              <label htmlFor="time-input">Time</label>
              {!eventId && (
                <div className={styles.quickList}>
                  <p>
                    Click a time on this quick-pick list or type the exact time
                    into the field below
                  </p>
                  {quickUpcomingIceTimes.map((s) => (
                    <label key={s}>
                      <input
                        type="checkbox"
                        checked={eventTime === s}
                        onChange={() => setEventTime(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              )}
              <input
                disabled={!!eventId}
                id="time-input"
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
              />
            </div>
            <label className={styles.field}>
              Names of those attending the event
              <input
                value={attendeeNames}
                onChange={(e) => setAttendeeNames(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              Contact phone number(s)
              <input
                value={contactPhoneNumber}
                onChange={(e) => setContactPhoneNumber(e.target.value)}
              />
            </label>
            <label className={styles.field}>
              Contact email address(es)
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </label>
            <p>
              If you provide your email address we can send you a copy of your
              submission.
            </p>
            {healthQuestionList.map((q, n) => (
              <div key={`question-${n}`} className={styles.healthQuestion}>
                {q}
                <YesNo
                  value={healthAnswers[n]}
                  onChange={(e) =>
                    setHealthAnswer(n, e.target.value === "true")
                  }
                />
              </div>
            ))}
            <div className={styles.formEnd}>
              <button onClick={onClickSubmit}>Submit</button>
            </div>
          </>
        )}
      </main>

      <footer className={styles.footer}>
        Copyright &copy; 2020 HPLD Software Corp., All Rights Reserved.{" - "}
        <a href="mailto:Dobes Vandermeer <dobesv+teamsnapattendance@gmail.com>">
          Email Us
        </a>
      </footer>
    </div>
  );
}
