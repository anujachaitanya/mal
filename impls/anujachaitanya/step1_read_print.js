const readline = require("readline");
const reader = require("./reader");
const printer = require("./printer");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = (string) => reader.read_ast(string);
const EVAL = (string) => string;
const PRINT = (string) => printer.pr_str(string);

const repl = (string) => PRINT(EVAL(READ(string)));

const loop = () => {
  rl.question("user> ", (string) => {
    try {
      console.log(repl(string));
    } catch (e) {
      console.log(e.message);
    } finally {
      loop();
    }
  });
};

loop();
