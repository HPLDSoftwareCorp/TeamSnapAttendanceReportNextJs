import { TeamSnapUser } from "../lib/teamsnap/TeamSnap";
import React from "react";

export interface ErrorBoxProps {
  error: Error | any;
}

export default function ErrorBox({ error }) {
  return (
    <div>
      <h3>Error</h3>
      {String(error.message || error)}
      <pre>{String(error.stack || "")}</pre>
      <p>
        Try reloading the page. If that doesn't fix it,{" "}
        <a href="mailto:Dobes Vandermeer <dobesv+teamsnapattendance@gmail.com>">
          Email Us
        </a>
      </p>
    </div>
  );
}
