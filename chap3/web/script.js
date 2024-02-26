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
};
window.onButtonClicked = onButtonClicked;