require("!!file-loader?name=[name].[ext]!./index.html");

/* required library for our React app */
const ReactDOM = require("react-dom/client");
const React = require("react");
const createReactClass = require("create-react-class");

/* required css for our application */
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

const Orders = [
  {
    remoteid: "000000189",
    custom: {
      customer: { full_name: "TOTO & CIE" },
      billing_address: "Some where in the world",
    },
    items: 2,
  },
  {
    remoteid: "000000190",
    custom: {
      customer: { full_name: "Looney Toons" },
      billing_address: "The Warner Bros Company",
    },
    items: 3,
  },
  {
    remoteid: "000000191",
    custom: {
      customer: { full_name: "Asterix & Obelix" },
      billing_address: "Armorique",
    },
    items: 29,
  },
  {
    remoteid: "000000192",
    custom: {
      customer: { full_name: "Lucky Luke" },
      billing_address: "A Cowboy doesn't have an address. Sorry",
    },
    items: 0,
  },
];

const Page = createReactClass({
  render() {
    return Orders.map(order => (
      <JSXZ in="orders" sel=".orderlinebody">
        <Z sel=".command-number > .text-block">{order.remoteid}</Z>
        <Z sel=".customer > .text-block">{order.custom.customer.full_name}</Z>
        <Z sel=".address > .text-block">{order.custom.billing_address}</Z>
        <Z sel=".quantity > .text-block">{order.items}</Z>
      </JSXZ>
    ));
  },
});

// const Page = createReactClass({
//   render() {
//     return <JSXZ in="orders" sel=".container"></JSXZ>;
//   }
// })

const domNode = document.getElementById("root");
console.log(domNode);
const Root = ReactDOM.createRoot(domNode);
Root.render(<Page />);
