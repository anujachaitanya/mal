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
  return token;
};

const read_list = (reader) => {
  const ast = [];
  let token;
  while ((token = reader.peek()) !== ")") {
    if (!token) throw new Error("unbalanced");
    ast.push(read_form(reader));
    reader.next();
  }
  return ast;
};

const read_form = (reader) => {
  const token = reader.peek();
  switch (token[0]) {
    case "(":
      reader.next();
      return read_list(reader);
  }
  return read_atom(reader);
};

const read_ast = (string) => {
  const tokens = tokenize(string);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_ast };
