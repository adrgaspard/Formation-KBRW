var React = require("react")
var createReactClass = require('create-react-class')

var orders = [
  {remoteid: "000000189", custom: {customer: {full_name: "TOTO & CIE"}, billing_address: "Some where in the world"}, items: 2}, 
  {remoteid: "000000190", custom: {customer: {full_name: "Looney Toons"}, billing_address: "The Warner Bros Company"}, items: 3}, 
  {remoteid: "000000191", custom: {customer: {full_name: "Asterix & Obelix"}, billing_address: "Armorique"}, items: 29}, 
  {remoteid: "000000192", custom: {customer: {full_name: "Lucky Luke"}, billing_address: "A Cowboy doesn't have an address. Sorry"}, items: 0}, 
]


var Table = createReactClass({
    render(){
      return orders.map(order => (<JSXZ in="orders" sel=".table-line">
      <Z sel=".command-number">{order.remoteid}</Z>
      <Z sel=".customer-name">{order.custom.customer.full_name}</Z>
      <Z sel=".adress1">{order.custom.billing_address}</Z>
      <Z sel=".quantity">{order.items}</Z>
      </JSXZ>
      ))
    }
})

module.exports = Table