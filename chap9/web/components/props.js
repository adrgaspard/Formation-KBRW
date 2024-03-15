var Qs = require('qs')

var remoteProps = {
  // user: (props)=>{
  //   return {
  //     url: "/api/me",
  //     prop: "user"
  //   }
  // },
  orders: (props)=>{
    // if(!props.user)
    //   return
    // var qs = {...props.qs, user_id: props.user.value.id}
    var qs = {...props.qs}
    var query = Qs.stringify(qs)
    return {
      url: "/api/orders" + (query == '' ? '' : '?' + query),
      prop: "orders"
    }
  },
  order: (props)=>{
    return {
      url: "/api/order/?id=" + props.order_id,
      prop: "order"
    }
  }
}

module.exports = remoteProps