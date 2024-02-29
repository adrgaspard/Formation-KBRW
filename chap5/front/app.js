const ReactDOM = require("react-dom/client");
const React = require("react");
const createReactClass = require("create-react-class");
const Qs = require("qs");
const Cookie = require("cookie");
const XMLHttpRequest = require("xhr2");

require("!!file-loader?name=[name].[ext]!./index.html");
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

const OrdersData = [
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

const RootDomNode = document.getElementById("root");
const Root = ReactDOM.createRoot(RootDomNode);

const HTTP = new (function () {
  this.get = (url) => this.req("GET", url);
  this.delete = (url) => this.req("DELETE", url);
  this.post = (url, data) => this.req("POST", url, data);
  this.put = (url, data) => this.req("PUT", url, data);
  this.req = (method, url, data) =>
    new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open(method, url);
      req.responseType = "text";
      req.setRequestHeader("accept", "application/json,*/*;0.8");
      req.setRequestHeader("content-type", "application/json");
      req.onload = () => {
        if (req.status >= 200 && req.status < 300) {
          resolve(req.responseText && JSON.parse(req.responseText));
        } else {
          reject({ http_code: req.status });
        }
      };
      req.onerror = (err) => {
        reject({ http_code: req.status });
      };
      req.send(data && JSON.stringify(data));
    });
})();

const RemoteProps = {
  orders: (props) => {
    const qs = { ...props.qs };
    const query = Qs.stringify(qs);
    return {
      url: "/api/orders" + (query == "" ? "" : "?" + query),
      prop: "orders",
    };
  },
  order: (props) => {
    return {
      url: "/api/order/" + props.order_id,
      prop: "order",
    };
  },
};

const Child = createReactClass({
  render() {
    const [ChildHandler, ...rest] = this.props.handlerPath;
    return <ChildHandler {...this.props} handlerPath={rest} />;
  },
});

const NotFound = createReactClass({
  render() {
    return <h1>Page Not Found</h1>;
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
  statics: {
    remoteProps: [RemoteProps.orders],
  },
  render() {
    const orders = (this.props.orders && this.props.orders.value) || [];
    return (
      <JSXZ in="orders" sel=".orders">
        <Z sel=".orders-table-body">
          {orders.map((order) => (
            <JSXZ in="orders" sel=".orderlinebody" key={order.remoteid}>
              <Z sel=".command-number > .text-block">{order.remoteid}</Z>
              <Z sel=".customer > .text-block">
                {order.custom.customer.full_name}
              </Z>
              <Z sel=".address > .text-block">
                {order.custom.billing_address.email}
              </Z>
              <Z sel=".quantity > .text-block">{order.custom.items.length}</Z>
              <Z sel=".order-link > a" tag="a" href={"/order/" + order.id}>
                <ChildrenZ />
              </Z>
            </JSXZ>
          ))}
        </Z>
      </JSXZ>
    );
  },
});

const Order = createReactClass({
  statics: {
    remoteProps: [RemoteProps.order],
  },
  render() {
    const order = this.props.order.value;
    console.log(order);
    return (
      <JSXZ in="order" sel=".container">
        <Z sel="h1">{"Order #" + order.remoteid}</Z>
        <Z sel=".order-general-data > .client">Client : {order.custom.customer.full_name}</Z>
        <Z sel=".order-general-data > .address">Address : {order.custom.billing_address.street[0]} {order.custom.billing_address.city}</Z>
        <Z sel=".order-items-body">
          {order.custom.items.map((item) => (
            <JSXZ in="order" sel=".order-items-line" key={item.item_id}>
              <Z sel=".product-name">{item.product_title}</Z>
              <Z sel=".quantity">{item.quantity_to_fetch}</Z>
              <Z sel=".unit-price">{item.unit_price}</Z>
              <Z sel=".total-price">{item.unit_price * item.quantity_to_fetch}</Z>
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
      return path == "/" && { handlerPath: [Layout, Header, Orders] };
    },
  },
  order: {
    path: (params) => {
      return "/order/" + params;
    },
    match: (path, qs) => {
      const matchResult = new RegExp("/order/([^/]*)$").exec(path);
      return (
        matchResult && {
          handlerPath: [Layout, Header, Order],
          order_id: matchResult[1],
        }
      );
    },
  },
};

let BrowserState = { Child: Child };

function addRemoteProps(props) {
  return new Promise((resolve, reject) => {
    let remoteProps = Array.prototype.concat.apply(
      [],
      props.handlerPath.map((c) => c.remoteProps).filter((p) => p)
    );
    remoteProps = remoteProps
      .map((spec_fun) => spec_fun(props))
      .filter((specs) => specs)
      .filter(
        (specs) => !props[specs.prop] || props[specs.prop].url != specs.url
      );
    if (remoteProps.length == 0) {
      return resolve(props);
    }
    const promiseMapper = (spec) => {
      return HTTP.get(spec.url).then((res) => {
        spec.value = res;
        return spec;
      });
    };
    const reducer = (acc, spec) => {
      acc[spec.prop] = { url: spec.url, value: spec.value };
      return acc;
    };
    const promiseArray = remoteProps.map(promiseMapper);
    return Promise.all(promiseArray)
      .then((xs) => xs.reduce(reducer, props), reject)
      .then((p) => {
        return addRemoteProps(p).then(resolve, reject);
      }, reject);
  });
}

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
  let route = null;
  let routeProps = null;
  for (const key in Routes) {
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
    return Root.render(<NotFound />);
  }
  addRemoteProps(BrowserState).then(
    (props) => {
      BrowserState = props;
      Root.render(<Child {...BrowserState} />);
    },
    (res) => {
      Root.render(<NotFound />);
    }
  );
}

function goTo(route, params, query) {
  const qs = Qs.stringify(query);
  const url = Routes[route].path(params) + (qs == "" ? "" : "?" + qs);
  history.pushState({}, "", url);
  onPathChange();
}

window.addEventListener("popstate", () => {
  onPathChange();
});
onPathChange();
