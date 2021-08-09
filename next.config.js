const { i18n } = require("./next-i18next.config");

module.exports = {
  /* config options here */
  images: {
    domains: ["raw.githubusercontent.com"],
  },
  i18n,
  eslint: {
    // Warning: Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  env
};
