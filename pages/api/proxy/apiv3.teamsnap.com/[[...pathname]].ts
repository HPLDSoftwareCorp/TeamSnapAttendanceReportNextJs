import createProxy from "lib/server/createProxy";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createProxy("apiv3.teamsnap.com");
