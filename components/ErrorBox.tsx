import { TeamSnapUser } from "../lib/client/teamsnap/TeamSnap";
import React from "react";

export interface ErrorBoxProps {
  error: Error | any;
}

export default function ErrorBox({ error }: ErrorBoxProps) {
  return (
    <div>
      <h3>Error</h3>
      {String(error.message || error)}
      <pre>{String(error.stack || "")}</pre>
      <p>
        Try reloading the page. If that doesn't fix it,{" "}
        <a href="mailto:Dobes Vandermeer <info@hpld.co>">
          Email Us
        </a>
      </p>
    </div>
  );
}
