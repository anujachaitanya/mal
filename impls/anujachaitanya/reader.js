const { List, Vector, Str, HashMap, Symbol } = require("./types");
class Reader {
  constructor(tokens) {
    this.tokens = tokens.slice();
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const currToken = this.peek();
    if (currToken) this.position++;
    return currToken;
  }
}

const tokenize = (string) => {
  const tokens = [];
  const reg =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  while ((token = reg.exec(string)[1])) {
    if (token) {
      tokens.push(token);
    }
  }
  return tokens;
};

const read_atom = (reader) => {
  const token = reader.peek();
  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9]+\.[0-9]+$/)) {
    return parseFloat(token);
  }
  if (token === "true") {
    return true;
  }
  if (token === "false") {
    return false;
  }

  if (token.startsWith('"')) {
    if (!/[^\\]"$/.test(token)) throw new Error("unbalanced");
    return new Str(token.substring(1, token.length - 1));
  }
  return new Symbol(token);
};

const read_seq = (reader, closingPar) => {
  const ast = [];
  let token;
  while ((token = reader.peek()) !== closingPar) {
    if (!token) throw new Error("unbalanced");
    ast.push(read_form(reader));
    reader.next();
  }
  return ast;
};

const read_vector = (reader) => {
  const ast = read_seq(reader, "]");
  return new Vector(ast);
};

const read_list = (reader) => {
  const ast = read_seq(reader, ")");
  return new List(ast);
};

const read_hashmap = (reader) => {
  const hashmap = read_seq(reader, "}");
  if (hashmap.length % 2 !== 0) {
    throw new Error("odd number of values in hashmap");
  }
  return new HashMap(hashmap);
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token[0]) {
    case "(":
      reader.next();
      return read_list(reader);
    case "[":
      reader.next();
      return read_vector(reader);
    case "{":
      reader.next();
      return read_hashmap(reader);
    case ")":
      throw new Error("unbalanced");
    case "]":
      throw new Error("unbalanced");
    case "}":
      throw new Error("unbalanced");
  }
  return read_atom(reader);
};

const read_str = (string) => {
  const tokens = tokenize(string);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };
