import createProxy from "lib/createProxy";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createProxy("auth.teamsnap.com");
