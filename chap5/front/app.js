const ReactDOM = require("react-dom/client");
const React = require("react");
const createReactClass = require("create-react-class");
const Qs = require("qs");
const Cookie = require("cookie");

require("!!file-loader?name=[name].[ext]!./index.html");
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

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
      <JSXZ in="orders" sel=".header">
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
