var createReactClass = require("create-react-class");

var Page = createReactClass({
  render() {
    return (
      <JSXZ in="template" sel=".container">
        <Z sel=".item">Burgers</Z>,<Z sel=".price">50</Z>
      </JSXZ>
    );
  },
});

ReactDOM.render(<Page />, document.getElementById("root"));

function onButtonClicked() {
  ReactDOM.render(
    <div>I was created from React!</div>,
    document.getElementById("root")
  );
  <>
    <Declaration var="test" value={42} />
    <Declaration var="kbrw" value="the best" />
  </>;
  console.log(test);
  console.log(kbrw);
}
window.onButtonClicked = onButtonClicked;
