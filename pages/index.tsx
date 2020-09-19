import Head from "next/head";
import styles from "../styles/Home.module.css";
import doLogin from "../lib/doLogin";
import { useAsync } from "react-async";
import loadMe from "../lib/loadMe";
import { useState } from "react";

export default function Home() {
  const { data: user, error, isPending, reload } = useAsync(loadMe);

  if (error) console.error(error);

  return (
    <div className={styles.container}>
      <Head>
        <title>TeamSnap Attendance Report</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>TeamSnap Attendance Report</h1>

        {isPending ? (
          <>Loading...</>
        ) : error ? (
          <>Error: {String(error.stack || error.message || error)}</>
        ) : user ? (
          <>You are logged in as {user.email}</>
        ) : (
          <button onClick={() => doLogin().then(() => reload())}>
            Login To TeamSnap
          </button>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}
