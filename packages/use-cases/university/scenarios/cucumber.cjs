module.exports = {
  default: {
    // Local scenario support files import each other with `.ts` extensions
    // because this package executes sources directly through ts-node/esm and
    // does not emit JavaScript from its noEmit TypeScript project.
    loader: ["ts-node/esm"],
    import: ["features/**/*.ts"],
    format: ["@serenity-js/cucumber", "json:target/cucumber-report.json"],
  },
};
