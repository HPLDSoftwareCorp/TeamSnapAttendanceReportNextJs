import initFirebaseWebApp from "./initFirebaseWebApp";

export default function logEvent(
  event: string,
  eventParams?: { [key: string]: any },
  options?: firebase.analytics.AnalyticsCallOptions
) {
  const firebase = initFirebaseWebApp();
  firebase.analytics().logEvent(event);
}
