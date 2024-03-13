const ReactDOM = require("react-dom/client");
const React = require("react");
const Qs = require("qs");
const XMLHttpRequest = require("xhr2");

const RootDomNode = document.getElementById("root");
const Root = ReactDOM.createRoot(RootDomNode);

const ApiBase = "/api";

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
      url: ApiBase + "/orders" + (query == "" ? "" : "?" + query),
      prop: "orders",
    };
  },
  order: (props) => {
    return {
      url: ApiBase + "/order/" + props.order_id,
      prop: "order",
    };
  },
};

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

module.exports = {
  Root,
  ApiBase,
  HTTP,
  RemoteProps,
  className,
  addRemoteProps,
};
