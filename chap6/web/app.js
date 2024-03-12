const ReactDOM = require("react-dom/client");
const React = require("react");
const createReactClass = require("create-react-class");
const Qs = require("qs");
const Cookie = require("cookie");
const XMLHttpRequest = require("xhr2");

require("!!file-loader?name=[name].[ext]!./index.html");
require("./webflow/css/loader.css");
require("./webflow/css/modal.css");
require("./webflow/css/order.css");
require("./webflow/css/orders.css");

const RootDomNode = document.getElementById("root");
const Root = ReactDOM.createRoot(RootDomNode);

function className() {
  const args = arguments;
  const classes = {};
  for (const i in args) {
    const arg = args[i];
    if (!arg) {
      continue;
    }
    if ("string" === typeof arg || "number" === typeof arg) {
      arg
        .split(" ")
        .filter((c) => c != "")
        .map((c) => {
          classes[c] = true;
        });
    } else if ("object" === typeof arg) {
      for (var key in arg) {
        classes[key] = arg[key];
      }
    }
  }
  return Object.keys(classes)
    .map((k) => (classes[k] && k) || "")
    .join(" ");
}

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
  modal(spec) {
    this.setState({
      modal: {
        ...spec,
        callback: (res) => {
          this.setState({ modal: null }, () => {
            if (spec.callback) {
              spec.callback(res);
            }
          });
        },
      },
    });
  },
  loader(spec) {
    this.setState({
      loader: true,
    });
    return new Promise((onSuccess, onError) => {
      spec.then(() => {
        this.setState({ loader: false });
      });
    });
  },
  getInitialState() {
    return { modal: null, loader: false };
  },
  render() {
    const loaderComponent = <Loader />;
    let modalComponent = {
      delete: (props) => <DeleteModal {...props} />,
    }[this.state.modal && this.state.modal.type];
    modalComponent = modalComponent && modalComponent(this.state.modal);
    return (
      <JSXZ in="orders" sel=".layout">
        <Z sel=".layout-container">
          <this.props.Child
            {...this.props}
            modal={this.modal}
            loader={this.loader}
          />
        </Z>
        <Z
          sel=".modal-wrapper"
          className={className(classNameZ, { hidden: !modalComponent })}
        >
          {modalComponent}
        </Z>
        <Z
          sel=".loader-wrapper"
          className={className(classNameZ, { hidden: !this.state.loader })}
        >
          {loaderComponent}
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
const ApiBase = "/api";

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
      return path == "/" && { handlerPath: [Layout, Header, Orders] };
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

const DeleteModal = createReactClass({
  render() {
    const callback = this.props.callback;
    return (
      <JSXZ in="modal" sel=".modal-content">
        <Z sel=".modal-text">{this.props.message}</Z>
        <Z sel=".modal-cancel" tag="a" onClick={() => callback(false)}>
          <ChildrenZ />
        </Z>
        <Z sel=".modal-confirm" tag="a" onClick={() => callback(true)}>
          <ChildrenZ />
        </Z>
      </JSXZ>
    );
  },
});

const Loader = createReactClass({
  render() {
    return <JSXZ in="loader" sel=".loader-content" />;
  },
});

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
