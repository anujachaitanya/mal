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

module.exports = { List, Vector, Str };
