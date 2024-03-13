const React = require("react");
const createReactClass = require("create-react-class");
const Qs = require("qs");
const Cookie = require("cookie");
const { Root, ApiBase, HTTP, RemoteProps, addRemoteProps } = require("./utils.js");
const Child = require("./components/base/child.js");
const NotFound = require("./components/base/not_found.js");
const Layout = require("./components/layout.js");
const Header = require("./components/header.js");

require("!!file-loader?name=[name].[ext]!./index.html");
require("./webflow/css/loader.css");
require("./webflow/css/modal.css");
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

let BrowserState = { Child: Child }

const Orders = createReactClass({
  statics: {
    remoteProps: [RemoteProps.orders],
  },
  getInitialState() {
    return { ...this.state, page: 0 };
  },
  pagination(page) {
    if (page < 0) {
      page = 0;
    }
    this.setState(
      {
        page: page,
      },
      () => {
        delete BrowserState.orders;
        goTo("orders", `?page=${this.state.page}`, null);
      }
    );
  },
  render() {
    const orders = (this.props.orders && this.props.orders.value) || [];
    return (
      <JSXZ in="orders" sel=".orders">
        <Z sel=".orders-table-body">
          {orders.map((order) => (
            <JSXZ in="orders" sel=".orderlinebody" key={order.remoteid}>
              <Z sel=".command-number > .text-block">{order.remoteid}</Z>
              {/* <Z sel=".customer > .text-block">
                {order.custom.customer.full_name}
              </Z>
              <Z sel=".address > .text-block">
                {order.custom.billing_address.email}
              </Z>
              <Z sel=".quantity > .text-block">{order.custom.items.length}</Z> */}
              <Z
                sel=".order-link > a"
                tag="a"
                onClick={() => {
                  goTo("order", order.id, null);
                  return false;
                }}
              >
                <ChildrenZ />
              </Z>
              <Z
                sel=".delete > a"
                tag="a"
                onClick={() => {
                  this.props.modal({
                    type: "delete",
                    title: "Order deletion",
                    message: `Are you sure you want to delete this ?`,
                    callback: (value) => {
                      if (value) {
                        this.props.loader(
                          new Promise((onSuccess, onError) => {
                            const url = ApiBase + Routes.order.path(order.id);
                            HTTP.delete(url)
                              .then((res) => {
                                delete BrowserState.orders;
                                goTo(
                                  "orders",
                                  `?page=${this.state.page}`,
                                  null
                                );
                              })
                              .then(() => {
                                onSuccess();
                              });
                          })
                        );
                      }
                    },
                  });
                  return false;
                }}
              >
                <ChildrenZ />
              </Z>
            </JSXZ>
          ))}
        </Z>
        <Z
          sel=".first-page"
          tag="a"
          onClick={() => {
            this.pagination(0);
            return false;
          }}
        >
          <ChildrenZ />
        </Z>
        <Z
          sel=".previous-page"
          tag="a"
          onClick={() => {
            this.pagination(this.state.page - 1);
            return false;
          }}
        >
          <ChildrenZ />
        </Z>
        <Z
          sel=".next-page"
          tag="a"
          onClick={() => {
            this.pagination(this.state.page + 1);
            return false;
          }}
        >
          <ChildrenZ />
        </Z>
        <Z sel=".current-page">{this.state.page + 1}</Z>
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
    return (
      <JSXZ in="order" sel=".container">
        <Z sel="h1">{"Order #" + order.remoteid}</Z>
        {/* <Z sel=".order-general-data > .client">
          Client : {order.custom.customer.full_name}
        </Z>
        <Z sel=".order-general-data > .address">
          Address : {order.custom.billing_address.street[0]}{" "}
          {order.custom.billing_address.city}
        </Z>
        <Z sel=".order-items-body">
          {order.custom.items.map((item) => (
            <JSXZ in="order" sel=".order-items-line" key={item.item_id}>
              <Z sel=".product-name">{item.product_title}</Z>
              <Z sel=".quantity">{item.quantity_to_fetch}</Z>
              <Z sel=".unit-price">{item.unit_price}</Z>
              <Z sel=".total-price">
                {item.unit_price * item.quantity_to_fetch}
              </Z>
            </JSXZ>
          ))}
        </Z> */}
      </JSXZ>
    );
  },
});

const Routes = {
  orders: {
    path: (params) => {
      return "/" + params;
    },
    match: (path, qs) => {
      const matchResult = new RegExp("/([^/]*)$").exec(path);
      return (
        matchResult && {
          handlerPath: [Layout, Header, Orders],
          order_id: matchResult[1],
        }
      );
    },
  },
  order: {
    path: (params) => {
      return "/order/" + (params || "");
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
