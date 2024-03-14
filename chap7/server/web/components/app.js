const React = require("react");
const { HTTP } = require("./utils.js");
const { Link, Routes } = require("./link.js");
const Child = require("./base/child.js");
const NotFound = require("./base/not_found.js");

require("!!file-loader?name=[name].[ext]!../index.html");
require("../webflow/css/loader.css");
require("../webflow/css/modal.css");
require("../webflow/css/order.css");
require("../webflow/css/orders.css");

let BrowserState = { Child: Child };

function inferPropsChange(path, query, cookies) {
  BrowserState = {
    ...BrowserState,
    path: path,
    qs: query,
    Link: Link,
    Child: Child,
  };
  let route;
  let routeProps;
  for (const key in Routes) {
    routeProps = Routes[key].match(path, query);
    if (routeProps) {
      route = key;
      break;
    }
  }
  if (!route) {
    return new Promise((res, reject) => reject({ http_code: 404 }));
  }
  BrowserState = {
    ...BrowserState,
    ...routeProps,
    route: route,
  };
  return addRemoteProps(BrowserState).then((props) => {
    BrowserState = props;
  });
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
  reaxt_server_render(params, render) {
    inferPropsChange(params.path, params.query, params.cookies).then(
      () => {
        render(<Child {...BrowserState} />);
      },
      (err) => {
        render(
          <NotFound message={"Not Found :" + err.url} code={err.http_code} />,
          err.http_code
        );
      }
    );
  },
  reaxt_client_render(initialProps, render) {
    BrowserState = initialProps;
    Link.renderFunc = render;
    window.addEventListener("popstate", () => {
      Link.onPathChange();
    });
    Link.onPathChange();
  },
};
