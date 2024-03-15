
require('!!file-loader?name=[name].[ext]!../index.html')
/* required library for our React app */
var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')

/* required css for our application */
require('../css/tuto.webflow.css');


var Qs = require('qs')
var Cookie = require('cookie')

var HTTP = require("./utils.js")
const routes = require("./routes.js")

const Layout = require("./classes/layout.js")
const Header = require("./classes/header.js")
const Orders = require("./classes/orders.js")
const Order = require("./classes/order.js")
const ErrorPage = require("./classes/error.js")
const Child = require("./classes/child.js")
const Page = require("./classes/page.js")
const Table = require("./classes/table.js")
const Link = require("./classes/link.js")

const debug = false;

var browserState = {}

function inferPropsChange(path,query,cookies){ // the second part of the onPathChange function have been moved here
  browserState = {
    ...browserState,
    path: path, qs: query,
    Link: Link,
    Child: Child
  }

  var route, routeProps
  for(var key in routes) {
    routeProps = routes[key].match(path, query)
    if(routeProps){
      route = key
      break
    }
  }

  if(!route){
    return new Promise( (res,reject) => reject({http_code: 404}))
  }
  browserState = {
    ...browserState,
    ...routeProps,
    route: route
  }

  return addRemoteProps(browserState).then(
    (props)=>{
      browserState = props
    })
}


function addRemoteProps(props){
  return new Promise((resolve, reject)=>{
    // Here we could call `[].concat.apply` instead of `Array.prototype.concat.apply`.
    // ".apply" first parameter defines the `this` of the concat function called.
    // Ex: [0,1,2].concat([3,4],[5,6])-> [0,1,2,3,4,5,6]
    // Is the same as : Array.prototype.concat.apply([0,1,2],[[3,4],[5,6]])
    // Also : `var list = [1,2,3]` is the same as `var list = new Array(1,2,3)`
    var remoteProps = Array.prototype.concat.apply([],
      props.handlerPath
        .map((c)=> c.remoteProps) // -> [[remoteProps.orders], null]
        .filter((p)=> p) // -> [[remoteProps.orders]]
    )

    if(debug) {
      console.log("RemoteProps")
      console.log(remoteProps)
    }
    
    remoteProps = remoteProps
      .map((spec_fun)=> spec_fun(props) ) // [{url: '/api/orders', prop: 'orders'}]
      .filter((specs)=> specs) // get rid of undefined from remoteProps that don't match their dependencies
      .filter((specs)=> !props[specs.prop] ||  props[specs.prop].url != specs.url) // get rid of remoteProps already resolved with the url
    if(remoteProps.length == 0){
      if(debug) {
        console.log('RESOLVED')
      }
      return resolve(props)
    }
    
    if(debug) {
      console.log("RemoteProps 2")
      console.log(remoteProps)
    }

    // All remoteProps can be queried in parallel. This is just the function definition, see its use below.
    const promise_mapper = (spec) => {
      if(debug) {
        console.log("PROMISE MAPPER")
        console.log(spec)
      }
      // we want to keep the url in the value resolved by the promise here : spec = {url: '/api/orders', value: ORDERS, prop: 'orders'}
      return HTTP.get(spec.url).then((res) => { spec.value = res; return spec })
    }

    const reducer = (acc, spec) => {
      if(debug) {
        console.log("REDUCER")
      }
      // spec = url: '/api/orders', value: ORDERS, prop: 'user'}
      acc[spec.prop] = {url: spec.url, value: spec.value}
      return acc
    }

    if(debug) {
      console.log("Before promise array")
    }

    const promise_array = remoteProps.map(promise_mapper)

    if(debug) {
      console.log("Promise array")
      console.log(promise_array)
    }

    return Promise.all(promise_array)
      .then(xs => xs.reduce(reducer, props), reject)
      .then((p) => {
        if(debug) {
          console.log("Promise then")
        }
      // recursively call remote props, because props computed from
      // previous queries can give the missing data/props necessary
      // to define another query
      return addRemoteProps(p).then(resolve, reject)
    }, reject)
  })
}

module.exports = {
  reaxt_server_render(params, render){
    inferPropsChange(params.path, params.query, params.cookies)
      .then(()=>{
        render(<Child {...browserState}/>)
      },(err)=>{
        render(<ErrorPage message={"Not Found :" + err.url } code={err.http_code}/>, err.http_code)
      })
  },
  reaxt_client_render(initialProps, render){
    browserState = initialProps
    Link.renderFunc = render
    window.addEventListener("popstate", ()=>{ Link.onPathChange() })
    Link.onPathChange()
  }
}
