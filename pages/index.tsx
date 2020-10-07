import { useRouter } from "next/router";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { res, req } = context;
  const m = /^(checkin|trace).([a-z0-9-]+).[a-z]+/i.exec(req.headers.host);
  if (m) {
    const org = m[2];
    const action = m[1];
    res.setHeader("location", `/${org}/${action}`);
    res.statusCode = 302;
    res.end();
  }
  return { props: {} };
};

export default function Home() {
  return (
    <div>
      If you are trying to use this site, you should have been provided with a
      specific link to the tool you are trying to use.
    </div>
  );
}
