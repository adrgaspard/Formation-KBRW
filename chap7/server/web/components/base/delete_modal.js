const React = require("react");
const createReactClass = require("create-react-class");

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

module.exports = DeleteModal;
