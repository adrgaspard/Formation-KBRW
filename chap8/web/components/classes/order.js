var React = require("react")
var createReactClass = require('create-react-class')
var remoteProps = require("../props")

var Order = createReactClass({
  statics: {
    remoteProps: [remoteProps.order]
  },

  computeAddress(address) {
    var fullAddress = "";

    var first = false;
    address.street.forEach(element => {
      if(!first) {
        fullAddress += "\n";
      }
      else{
        first = false;
      }

      fullAddress += element;
    });

    fullAddress += "\n" + address.postcode + " " + address.city;

    return fullAddress;
  },
  
  render(){
    return <JSXZ in="order" sel=".order-container">
      <Z sel=".page-header">
        <ChildrenZ/>
      </Z>

      <Z sel=".customer">
      {
          <JSXZ in="order" sel=".customer-details">
            <Z sel=".client-info">{this.props.order.value.custom.customer.full_name}</Z>
            <Z sel=".client-address">{this.computeAddress(this.props.order.value.custom.billing_address)}</Z>
            <Z sel=".command-number">{this.props.order.value.remoteid}</Z>
          </JSXZ>
      }
      </Z>


      <Z sel=".table-headers">
        <ChildrenZ/>
      </Z>

      <Z sel=".table-lines">
      {
        this.props.order.value.custom.items.map(item => (
          <JSXZ in="order" sel=".table-line">
            <Z sel=".product-name">{item.product_title}</Z>
            <Z sel=".quantity">{item.quantity_to_fetch}</Z>
            <Z sel=".unit-price">{item.unit_price}</Z>
            <Z sel=".total-price">{item.quantity_to_fetch * item.unit_price}</Z>
          </JSXZ>))
      }
      </Z>
    </JSXZ>
  }
})

module.exports = Order