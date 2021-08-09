const chalk = require("chalk");

exports.error = (first,...msg) =>
    console.log(
        chalk.red("[ Error ]"),
        first,
        chalk.gray(...msg),
    );

exports.log = (...msg) =>
    console.log(chalk.yellow("[ Script ]"), chalk.gray(...msg));
