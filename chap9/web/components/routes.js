const Layout = require("./classes/layout.js")
const Header = require("./classes/header.js")
const Orders = require("./classes/orders.js")
const Order = require("./classes/order.js")

var routes = {
    "orders": {
      path: (params) => {
        return "/";
      },
      match: (path, qs) => {
        return (path == "/") && {handlerPath: [Layout, Header, Orders]}; // Note that we use the "&&" expression to simulate a IF statement
      }
    },
    "order": {
      path: (params) => {
        return "/order/" + params;
      },
      match: (path, qs) => {
        var r = new RegExp("/order/([^/]*)$").exec(path);
        return r && {handlerPath: [Layout, Header, Order],  order_id: r[1]}; // Note that we use the "&&" expression to simulate a IF statement
      }
    }
}
  
module.exports = routes