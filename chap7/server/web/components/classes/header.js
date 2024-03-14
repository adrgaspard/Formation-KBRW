var React = require("react")
var createReactClass = require('create-react-class')

var Header = createReactClass({
    render(){
      return <JSXZ in="orders" sel=".header-container">
          <Z sel=".page-header">
            <ChildrenZ/>
          </Z>
          <Z sel=".page-container">
            <this.props.Child {...this.props}/>
          </Z>
        </JSXZ>
    }
})

module.exports = Header