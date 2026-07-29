module.exports = {
  default: {
    loader: ["ts-node/esm"],
    import: ["features/**/*.ts"],
    format: ["@serenity-js/cucumber", "json:target/cucumber-report.json"],
  },
};
