import { createProxyMiddleware } from "http-proxy-middleware";

const createProxy = (domain: string) =>
  createProxyMiddleware({
    changeOrigin: true,
    logLevel: "debug",
    autoRewrite: true,
    headers: { host: domain },
    onProxyReq: function onProxyReq(proxyReq, req, res) {
      proxyReq.removeHeader("referer");
      proxyReq.removeHeader("cookie");
      proxyReq.setHeader("user-agent", "node-js");
    },
    onProxyRes: (proxyRes, req, res) => {
      delete proxyRes.headers["set-cookie"];
    },
    pathRewrite: {
      "^/api/proxy/[^/]*/?": "/",
    },
    target: "https://" + domain,
  });
export default createProxy;
