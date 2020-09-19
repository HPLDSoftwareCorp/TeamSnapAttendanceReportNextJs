import createProxy from "lib/createProxy";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

export default createProxy("apiv3.teamsnap.com");
