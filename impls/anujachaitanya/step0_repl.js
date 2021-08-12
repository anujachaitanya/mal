const readline = require("readline");

const reader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (str) => str;
const EVAL = (str, env) => str;
const PRINT = (str) => str;

const repl = (str) => PRINT(EVAL(READ(str), {}));

const loop = function () {
  reader.question("user> ", (str) => {
    console.log(repl(str));
    loop();
  });
};

loop();
