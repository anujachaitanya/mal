class List {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "(" + this.ast.map((x) => x.toString()).join(" ") + ")";
  }
}

class Vector {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "[" + this.ast.map((x) => x.toString()).join(" ") + "]";
  }
}

class Str {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return '"' + this.str + '"';
  }
}

class HashMap {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return "{" + this.ast.map((x) => x.toString()).join(" ") + "}";
  }
}

class Symbol {
  constructor(str) {
    this.name = str;
  }

  toString() {
    return this.name.toString();
  }
}

module.exports = { List, Vector, Str, HashMap, Symbol };
