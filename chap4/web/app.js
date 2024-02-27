require("!!file-loader?name=[name].[ext]!./index.html");

/* required library for our React app */
const ReactDOM = require("react-dom/client");
const React = require("react");
const createReactClass = require("create-react-class");

/* required css for our application */
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

const Page = createReactClass({
  render() {
    return <JSXZ in="orders" sel=".container"></JSXZ>;
  },
});

const domNode = document.getElementById("root");
console.log(domNode);
const Root = ReactDOM.createRoot(domNode);
Root.render(<Page />);
