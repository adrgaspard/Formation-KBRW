const Bert = require('@kbrw/node_erlastic/bert');
Bert.convention = Bert.ELIXIR;
Bert.all_binaries_as_string = true;

require("@kbrw/node_erlastic").server(function (term, _from, _data, done) {
  if (term == "hello") return done("reply", "world");
  throw new Error("Unexpected request");
});
