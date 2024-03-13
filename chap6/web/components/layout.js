const React = require("react");
const createReactClass = require("create-react-class");
const { className } = require("../utils.js");
const DeleteModal = require("./base/delete_modal.js");
const Loader = require("./base/loader.js");

const Layout = createReactClass({
  modal(spec) {
    this.setState({
      modal: {
        ...spec,
        callback: (res) => {
          this.setState({ modal: null }, () => {
            if (spec.callback) {
              spec.callback(res);
            }
          });
        },
      },
    });
  },
  loader(spec) {
    this.setState({
      loader: true,
    });
    return new Promise((onSuccess, onError) => {
      spec.then(() => {
        this.setState({ loader: false });
      });
    });
  },
  getInitialState() {
    return { modal: null, loader: false };
  },
  render() {
    const loaderComponent = <Loader />;
    let modalComponent = {
      delete: (props) => <DeleteModal {...props} />,
    }[this.state.modal && this.state.modal.type];
    modalComponent = modalComponent && modalComponent(this.state.modal);
    return (
      <JSXZ in="orders" sel=".layout">
        <Z sel=".layout-container">
          <this.props.Child
            {...this.props}
            modal={this.modal}
            loader={this.loader}
          />
        </Z>
        <Z
          sel=".modal-wrapper"
          className={className(classNameZ, { hidden: !modalComponent })}
        >
          {modalComponent}
        </Z>
        <Z
          sel=".loader-wrapper"
          className={className(classNameZ, { hidden: !this.state.loader })}
        >
          {loaderComponent}
        </Z>
      </JSXZ>
    );
  },
});

module.exports = Layout;
