module.exports = {
  input: ["src/**/*.{ts,tsx}"],
  output: "src/locales",
  options: {
    debug: true,

    removeUnusedKeys: true,

    func: {
      list: ["t", "t"],
      extensions: [".ts", ".tsx"],
    },

    lngs: ["en", "zh-CN", "zh-TW"],
    defaultLng: "en",

    ns: ["translation"],
    defaultNs: "translation",

    defaultValue: function(lng, ns, key) {
      if (lng === "en") {
        // Return key as the default value for English language
        return key;
      }
      // Return the string '__NOT_TRANSLATED__' for other languages
      return "__NOT_TRANSLATED__";
    },

    resource: {
      loadPath: "{{lng}}.json",
      savePath: "{{lng}}.json",
    },

    nsSeparator: false,
    keySeparator: false,
  },
};
