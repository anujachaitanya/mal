const { Env } = require("./env");
const { Symbol, Fn, Nil, List, Vector } = require("./types");
const { pr_str } = require("./printer");

const core = new Env(null);

core.set(new Symbol("+"), new Fn((args) => args.reduce((r, x) => r + x, 0)));

core.set(
  new Symbol("-"),
  new Fn((args) => {
    if (args.length === 0) {
      throw new Error(`wrong number of args(${args.length}) passed to : -`);
    }
    return args.reduce((r, x) => r - x);
  })
);

core.set(new Symbol("*"), new Fn((args) => args.reduce((r, x) => r * x, 1)));

core.set(
  new Symbol("/"),
  new Fn((args) => {
    if (args.length === 0) {
      throw new Error(`wrong number of args(${args.length}) passed to : /`);
    }
    return args.reduce((r, x) => r / x);
  })
);

core.set(
  new Symbol("prn"),
  new Fn((args) => {
    args[0] && console.log(pr_str(args[0]));
    return new Nil();
  })
);

core.set(
  new Symbol("list"),
  new Fn((args) => {
    return new List(args);
  })
);

core.set(
  new Symbol("list?"),
  new Fn((args) => {
    return args[0] instanceof List;
  })
);

core.set(
  new Symbol("empty?"),
  new Fn((args) => {
    if (args[0] instanceof List || args[0] instanceof Vector)
      return args[0].isEmpty();
    throw new Error("count does not support type: " + args[0]);
  })
);

core.set(
  new Symbol("count"),
  new Fn((args) => {
    if (args[0].count !== undefined) return args[0].count();
    throw new Error("count does not support type: " + args[0]);
  })
);

core.set(
  new Symbol("="),
  new Fn((args) => {
    if (args.length === 0) throw new Error(`wrong number of args`);
    return new Set(args).size === 1;
  })
);

core.set(
  new Symbol(">"),
  new Fn((args) => {
    if (args.length === 0) throw new Error(`wrong number of args`);
    return args.slice(0, -1).every((x, i) => x > args[i + 1]);
  })
);

core.set(
  new Symbol("<"),
  new Fn((args) => {
    if (args.length === 0) throw new Error(`wrong number of args`);
    return args.slice(0, -1).every((x, i) => x < args[i + 1]);
  })
);

core.set(
  new Symbol(">="),
  new Fn((args) => {
    if (args.length === 0) throw new Error(`wrong number of args`);
    return args.slice(0, -1).every((x, i) => x >= args[i + 1]);
  })
);

core.set(
  new Symbol("<="),
  new Fn((args) => {
    if (args.length === 0) throw new Error(`wrong number of args`);
    return args.slice(0, -1).every((x, i) => x <= args[i + 1]);
  })
);

core.set(
  new Symbol("pr-str"),
  new Fn((args) => {
    const strings = args.map(pr_str);
    console.log(strings);
    return '"' + strings.join(" ") + '"';
  })
);

module.exports = { core };
