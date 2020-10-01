import createProxy from "lib/server/createProxy";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createProxy("auth.teamsnap.com");
