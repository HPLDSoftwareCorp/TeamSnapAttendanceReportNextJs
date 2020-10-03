import Head from "next/head";
import styles from "styles/trace.module.css";
import doLogin from "lib/client/teamsnap/doLogin";
import { useAsync } from "react-async";
import loadMe from "lib/client/teamsnap/loadMe";
import doLogout from "lib/client/teamsnap/doLogout";
import loadActiveTeams from "lib/client/teamsnap/loadActiveTeams";
import {
  TeamSnapEvent,
  TeamSnapTeam,
  TeamSnapUser,
} from "lib/client/teamsnap/TeamSnap";
import loadEventsForTeams from "lib/client/teamsnap/loadEventsForTeams";
import { useState } from "react";
import xor from "lodash/xor";
import React from "react";
import EventData from "components/EventData";
import formatTeamLabel from "lib/client/teamsnap/formatTeamLabel";
import subWeeks from "date-fns/subWeeks";
import startOfWeek from "date-fns/startOfWeek";
import isBefore from "date-fns/isBefore";
import { endOfDay, endOfWeek } from "date-fns";
import areIntervalsOverlapping from "date-fns/areIntervalsOverlapping";
import format from "date-fns/format";
import parse from "date-fns/parse";
import TopBar from "components/TopBar";
import { useRouter } from "next/router";

function AllOrNone<T>({
  options,
  selected,
  setSelected,
}: {
  options: T[];
  selected: T[];
  setSelected: (value: ((prevState: T[]) => T[]) | T[]) => void;
}) {
  return (
    <div className={styles.noPrint}>
      <button
        disabled={options.length === selected.length}
        onClick={() => setSelected(options)}
      >
        All
      </button>
      <button disabled={!selected.length} onClick={() => setSelected([])}>
        None
      </button>
    </div>
  );
}

export default function Trace() {
  const router = useRouter();
  const org = String(router.query.org);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [agreed, setAgreed] = useState<boolean>(
    !!(process.browser && sessionStorage.agreedToTerms)
  );
  const [onlyAttendees, setOnlyAttendees] = useState<boolean>(true);
  const onClickAgree = () => {
    sessionStorage["agreedToTerms"] = true;
    setAgreed(true);
  };
  const toggleTeam = (teamId: number) =>
    setSelectedTeams(xor([teamId], selectedTeams));
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const toggleLocation = (locationName: string) =>
    setSelectedLocations(xor([locationName], selectedLocations));
  const [startDate, setStartDate] = useState<Date>(
    startOfWeek(subWeeks(Date.now(), 1))
  );
  const [endDate, setEndDate] = useState<Date>(endOfWeek(Date.now()));
  const userState = useAsync<TeamSnapUser | null>(loadMe);
  const user = userState.data;
  const teamsState = useAsync<TeamSnapTeam[]>({
    promise: user && loadActiveTeams(user),
  });
  const activeTeams = teamsState.data || [];
  const eventsState = useAsync<TeamSnapEvent[]>({
    promise: loadEventsForTeams(selectedTeams, startDate, endDate),
  });
  const events = (eventsState.data || []).filter(
    (e) =>
      e.startDate &&
      isBefore(startDate, endDate) &&
      areIntervalsOverlapping(
        { start: startDate, end: endDate },
        { start: e.startDate, end: e.endDate || e.startDate },
        { inclusive: true }
      )
  );
  const locations = Array.from(
    (events && new Set(events.map((e) => e.locationName))) || []
  );
  const matchedEvents = events.filter((event) =>
    selectedLocations.includes(event.locationName)
  );
  const teamMap = new Map<number, TeamSnapTeam>(
    activeTeams.map((t) => [t.id, t])
  );
  const leagues = Array.from(
    new Set(activeTeams.map((t) => t.leagueName))
  ).filter(Boolean);

  return (
    <div className={styles.container}>
      <Head>
        <title>
          Contact Tracing Report -{" "}
          {leagues.length === 1 ? leagues[0] + " - " : ""}
          {format(startDate, "yyyy-MM-dd")} thru {format(endDate, "yyyy-MM-dd")}{" "}
        </title>
      </Head>

      <main className={styles.main}>
        <TopBar
          title="Contact Tracing"
          user={user}
          onClickLogout={() => doLogout().then(() => userState.reload())}
        />
        {userState.isPending ? (
          <>Loading...</>
        ) : userState.error ? (
          <>
            <h3>Error</h3>
            {String(userState.error.message || userState.error)}
            <pre>{String(userState.error.stack || "")}</pre>
            <p>
              Try reloading the page. If that doesn't fix it,{" "}
              <a href="mailto:Dobes Vandermeer <dobesv+teamsnapattendance@gmail.com>">
                Email Us
              </a>
            </p>
          </>
        ) : user ? (
          <>
            <div className={styles.dateRange}>
              <h3>Options</h3>
              <table>
                <tbody>
                  <tr>
                    <th>Start Date</th>
                    <td>
                      <input
                        type="date"
                        required
                        max={format(endDate, "yyyy-MM-dd")}
                        value={format(startDate, "yyyy-MM-dd")}
                        onChange={(e) =>
                          setStartDate(
                            parse(e.target.value, "yyyy-MM-dd", startDate)
                          )
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>End Date</th>
                    <td>
                      <input
                        type="date"
                        required
                        min={format(startDate, "yyyy-MM-dd")}
                        value={format(endDate, "yyyy-MM-dd")}
                        onChange={(e) =>
                          setEndDate(
                            endOfDay(
                              parse(e.target.value, "yyyy-MM-dd", endDate)
                            )
                          )
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <th>Availability</th>
                    <td>
                      <label>
                        <input
                          type="checkbox"
                          checked={onlyAttendees}
                          onChange={() => setOnlyAttendees(!onlyAttendees)}
                        />{" "}
                        Only show contacts with availability YES
                      </label>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {isBefore(endDate, startDate) ? (
              <strong>Please choose an end date after the start date</strong>
            ) : teamsState.isPending ? (
              <>Loading teams...</>
            ) : teamsState.error ? (
              <>
                <h3>Failed to load your teams</h3> {String(teamsState.error)}
              </>
            ) : (
              <div>
                {activeTeams.length ? (
                  <>
                    <h3>Teams ({activeTeams.length})</h3>
                    <ul className={styles.checkboxes}>
                      {activeTeams.map((team) => (
                        <li key={team.id}>
                          <label>
                            <input
                              checked={selectedTeams.includes(team.id)}
                              type="checkbox"
                              onChange={() => toggleTeam(team.id)}
                            />
                            <strong>{formatTeamLabel(team)}</strong>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <AllOrNone
                      options={activeTeams.map(({ id }) => id)}
                      selected={selectedTeams}
                      setSelected={setSelectedTeams}
                    />
                  </>
                ) : (
                  <strong>You have no teams in your TeamSnap account</strong>
                )}
                {selectedTeams.length === 0 ? (
                  <h3>Select one or more teams to continue.</h3>
                ) : eventsState.isPending ? (
                  <h3>Loading events and locations...</h3>
                ) : locations?.length === 0 ? (
                  <h3>No Events Found, try adjusting the date range.</h3>
                ) : (
                  <>
                    <h3>Locations ({locations.length})</h3>
                    <ul className={styles.checkboxes}>
                      {locations.map((locationName) => (
                        <li key={locationName}>
                          <label>
                            <input
                              checked={selectedLocations.includes(locationName)}
                              type="checkbox"
                              onChange={() => toggleLocation(locationName)}
                            />
                            <strong>{locationName}</strong>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <AllOrNone
                      options={locations}
                      selected={selectedLocations}
                      setSelected={setSelectedLocations}
                    />

                    {locations.length === 0 ? (
                      <p>Select one or more locations to continue</p>
                    ) : matchedEvents.length === 0 && events.length > 0 ? (
                      <h3>No events in given date range and locations</h3>
                    ) : (
                      <>
                        <h3>Events ({matchedEvents.length})</h3>
                        {matchedEvents.map((event) => (
                          <EventData
                            key={event.id}
                            event={event}
                            org={org}
                            team={teamMap.get(event.teamId)}
                            onlyAttendees={onlyAttendees}
                          />
                        ))}
                        <div className={styles.noPrint}>
                          <h3>Distribution</h3>
                          <p>
                            To send this, print the page to a PDF file using
                            your browser's print feature, and send that PDF to
                            the appropriate person.
                          </p>
                          <p>
                            <button onClick={() => print()}>Print</button>
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div>
            <p>
              This reporting tool extracts attendance information from TeamSnap.
              It is built to help with mandatory attendance reporting for
              contact tracing purposes. Because it makes use of your existing
              TeamSnap "availability" feature, it can save a LOT of manual
              paperwork over having team members manually fill out digital or
              paper forms. All you have to do is make sure that the availability
              is correctly set to reflect who attended each event, and then you
              can run this report.
            </p>
            <p>To get started, click the "Log In" button below.</p>
            <p>
              <strong>Terms of Service</strong> This service is provided by HPLD
              Software Corp. Availability, accuracy, and reliability of this
              service is not guaranteed - use at your own risk.
            </p>
            <p>
              <strong>Privacy</strong> Team attendance and contact data is kept
              private and handled entirely on your own device / computer, and is
              not shared with us or any third party. We may keep records of the
              name, email address, league name, TeamSnap user/league ID, and IP
              address of users who log in.
            </p>
            <p>
              <strong>Pricing</strong> Free for now. Buy us a drink if this tool
              saves you time. If we introduce up-front pricing later, existing
              active users be grandfathered in.
            </p>
            <p>
              <label>
                <input
                  checked={agreed}
                  disabled={agreed}
                  type="checkbox"
                  onChange={onClickAgree}
                />
                I agree to these terms
              </label>
            </p>
            <button
              disabled={!agreed}
              onClick={() => doLogin().then(() => userState.reload())}
            >
              Log In
            </button>
          </div>
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
