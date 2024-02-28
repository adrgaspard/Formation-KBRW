const ReactDOM = require("react-dom/client");
const React = require("react");
const createReactClass = require("create-react-class");
const Qs = require("qs");
const Cookie = require("cookie");

require("!!file-loader?name=[name].[ext]!./index.html");
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

const OrdersData = [
  {remoteid
    : "000000189",
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

const RootDomNode = document.getElementById("root");
const Root = ReactDOM.createRoot(RootDomNode);

const Child = createReactClass({
  render() {
    const [ChildHandler, ...rest] = this.props.handlerPath;
    return <ChildHandler {...this.props} handlerPath={rest} />;
  },
});

const Layout = createReactClass({
  render() {
    return (
      <JSXZ in="orders" sel=".layout">
        <Z sel=".layout-container">
          <this.props.Child {...this.props} />
        </Z>
      </JSXZ>
    );
  },
});

const Header = createReactClass({
  render() {
    return (
      <JSXZ in="orders" sel=".header">
        <Z sel=".header-container">
          <this.props.Child {...this.props} />
        </Z>
      </JSXZ>
    );
  },
});

const Orders = createReactClass({
  render() {
    return (
      <JSXZ in="orders" sel=".orders">
        <Z sel=".orders-table-body">
          {OrdersData.map((order, index) => (
            <JSXZ in="orders" sel=".orderlinebody" key={order.remoteid}>
              <Z sel=".command-number > .text-block">{order.remoteid}</Z>
              <Z sel=".customer > .text-block">
                {order.custom.customer.full_name}
              </Z>
              <Z sel=".address > .text-block">{order.custom.billing_address}</Z>
              <Z sel=".quantity > .text-block">{order.items}</Z>
            </JSXZ>
          ))}
        </Z>
      </JSXZ>
    );
  },
});

const Routes = {
  orders: {
    path: (params) => {
      return "/";
    },
    match: (path, qs) => {
      console.log(path);
      return path == "/" && { handlerPath: [Layout, Header, Orders] };
    },
  },
  order: {
    path: (params) => {
      return "/order/" + params;
    },
    match: (path, qs) => {
      return (
        new RegExp("/order/([^/]*)$").exec(path) && {
          handlerPath: [Layout, Header, Order],
          order_id: r[1],
        }
      );
    },
  },
};

let BrowserState = { Child: Child };

function onPathChange() {
  const path = location.pathname;
  const qs = Qs.parse(location.search.slice(1));
  const cookies = Cookie.parse(document.cookie);
  BrowserState = {
    ...BrowserState,
    path: path,
    qs: qs,
    cookie: cookies,
  };
  let route;
  let routeProps;
  for (var key in Routes) {
    routeProps = Routes[key].match(path, qs);
    if (routeProps) {
      route = key;
      break;
    }
  }
  BrowserState = {
    ...BrowserState,
    ...routeProps,
    route: route,
  };
  if (!route) {
    return Root.render(<ErrorPage message={"Not Found"} code={404} />);
  }
  Root.render(<Child {...BrowserState} />);
}

window.addEventListener("popstate", () => {
  onPathChange();
});
onPathChange();
