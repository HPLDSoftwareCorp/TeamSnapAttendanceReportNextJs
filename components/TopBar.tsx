import styles from "styles/TopBar.module.css";
import React, { MouseEventHandler } from "react";

export interface TopBarProps {
  onClickLogout: MouseEventHandler;
  title: string;
  user?: { email: string } | null;
}

export default function TopBar({ onClickLogout, title, user }: TopBarProps) {
  return (
    <div className={styles.topBar}>
      <h1>{title}</h1>
      {user && (
        <div className={styles.loginState}>
          {user.email} <button onClick={onClickLogout}>Log Out</button>
        </div>
      )}
    </div>
  );
}
