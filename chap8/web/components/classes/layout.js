var React = require("react")
var createReactClass = require('create-react-class')

var cn = function(){
  var args = arguments, classes = {}
  for (var i in args) {
    var arg = args[i]
    if(!arg) continue
    if ('string' === typeof arg || 'number' === typeof arg) {
      arg.split(" ").filter((c)=> c!="").map((c)=>{
        classes[c] = true
      })
    } else if ('object' === typeof arg) {
      for (var key in arg) classes[key] = arg[key]
    }
  }
  return Object.keys(classes).map((k)=> classes[k] && k || '').join(' ')
}

var DeleteModal = createReactClass({
  render(){
    return <JSXZ in="confirmation" sel=".confirmation-wrapper">
          <Z sel=".confirm-btn" onClick={()=> this.props.callback(true)}>
            <ChildrenZ/>
          </Z>

          <Z sel=".decline-btn" onClick={()=> this.props.callback(false)}>
            <ChildrenZ/>
          </Z>
    </JSXZ>
  }
});

var LoadingModal = createReactClass({
  render(){
    return <JSXZ in="loading" sel=".loader-wrapper">
      <Z sel=".loader-content">
        <ChildrenZ/>
      </Z>
    </JSXZ>
  }
});

var Layout = createReactClass({
  statics: {},

  getInitialState: function() {
    return {
      modal: null,
      displayLoader: false
    };
  },
  
  modal(spec) {
    this.setState({modal: {
      ...spec, callback: (res)=>{
        this.setState({modal: null},()=>{
          if(spec.callback) spec.callback(res)
        })
      }
    }})
  },

  loader(func) {
    this.setState({displayLoader: true});

    return new Promise((s, f) => {
      func.then(() => {
        this.setState({displayLoader: false})
      })
    });
  },
    
  render(){
    var modal_component = {
        'delete': (props) => <DeleteModal {...props}/>
    }[this.state.modal && this.state.modal.type];
    modal_component = modal_component && modal_component(this.state.modal);

    var props = {
      ...this.props, modal: this.modal, loader: this.loader
    }

    var modal_loader = <LoadingModal/>

    return <JSXZ in="orders" sel=".layout-container">
        <Z sel=".modal-wrapper2" className={cn(classNameZ, {'hidden': !modal_component})}>
          {modal_component}
        </Z>
        
        <Z sel=".loading-wrapper" className={cn(classNameZ, {'hidden': !this.state.displayLoader})}>
          {modal_loader}
        </Z>

        <Z sel=".layout-wrapper">
          <this.props.Child {...props}/>
        </Z>
      </JSXZ>
  }
})

module.exports = Layout