var ReactDOM = require('react-dom')
var React = require("react")
var createReactClass = require('create-react-class')
var remoteProps = require('../props.js')

var HTTP = require("../utils.js")


var Orders = createReactClass({
    statics: {
      remoteProps: [remoteProps.orders]
    },

    getInitialState: function() {
      return {
        value: this.props.orders.value,
        page: 0,
        rows: 30,
        sort: "creation_date_index"
      };
    },
    
    computeQuantities(items) {
      var total = 0;

       items.forEach(element => {
          total += element.quantity_to_fetch;
        });

      return total;
    },

    computeQuantitiesRiak(items) {
      var total = 0;

       items.forEach(element => {
          total += element;
        });

      return total;
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

    onClickMode(id) {
      this.props.modal({
        type: 'delete',
        title: 'Order deletion',
        message: `Are you sure you want to delete this ?`,
        callback: (trigger) => {
          if (trigger){
            this.props.loader(new Promise((success, f) => {
              HTTP.delete("/database?id=" + id)
              .then((res) => {
                this.setState({value: res});
              })
              .then(() => {
                success();
              })
            }));
          }
        }
      });
    },

    onClickChangePage(pageNumber) {
      this.props.loader(new Promise((success, f) => {
        HTTP.get("/api/orders?page=" + pageNumber + "&rows=" + this.state.rows + "&sort=" + this.state.sort)
        .then((res) => {
          this.setState({value: res, page: pageNumber});
        })
        .then(() => {
          success();
        })
      }));
    },

    onClickSearch() {
      this.props.loader(new Promise((success, f) => {
        searchValue = document.getElementById('search').value;
        searchValue = searchValue.replace(":", "=");

        HTTP.get("/api/orders?page=" + this.state.page + "&rows=" + this.state.rows + "&sort=" + this.state.sort + "&" + searchValue)
        .then((res) => {
          this.setState({value: res});
        })
        .then(() => {
          success();
        })
      }));
    },

    render(){
      return <JSXZ in="orders" sel=".orders-container">
        <Z sel=".search-orders">
          {
            <JSXZ in="orders" sel=".w-form">
              <Z sel=".submit-button" onClick={()=> this.onClickSearch()}>
                <ChildrenZ/>  
              </Z>
            </JSXZ>
          }
        </Z>

        <Z sel=".table-headers">
          <ChildrenZ/>
        </Z>

        <Z sel=".table-lines">
        {
          this.state.value.map(order => (
            <JSXZ in="orders" sel=".table-line" key={order.id}>
              <Z sel=".command-number">{order.remoteid}</Z>
              <Z sel=".customer-name">{order["custom.customer.full_name"]}</Z>
              {/* <Z sel=".adress1">{this.computeAddress(order.custom.billing_address)}</Z> */}
              <Z sel=".adress1">{order["custom.shipping_address.city"]}</Z>
              {/* <Z sel=".quantity">{this.computeQuantities(order.custom.items)}</Z> */}
              <Z sel=".quantity">{this.computeQuantitiesRiak(order["custom.items.quantity_to_fetch"])}</Z>
              <Z sel=".details"><a href={"/order/" + order.id}></a></Z>
              <Z sel=".delete" onClick={()=> this.onClickMode(order.id)}><a href="#"></a></Z>
              <Z sel=".pay-status">Status: {order["status.state"]}</Z>
            </JSXZ>))
        }
        </Z>

        <Z sel=".page-selector">
          <div class="w-row">
            <div class="w-col w-col-2">
              <div class="pagination-link" onClick={()=> this.onClickChangePage(0)}><a href="#">1</a></div>
            </div>
            <div class="w-col w-col-2">
              <div class="pagination-link" onClick={()=> this.onClickChangePage(1)}><a href="#">2</a></div>
            </div>
            <div class="w-col w-col-2">
              <div class="pagination-link" onClick={()=> this.onClickChangePage(2)}><a href="#">3</a></div>
            </div>
            <div class="w-col w-col-2">
              <div class="pagination-link" onClick={()=> this.onClickChangePage(3)}><a href="#">4</a></div>
            </div>
          </div>
          {/* {
            <JSXZ in="orders" sel=".page-selector">
              <Z sel=".pagination-link" onClick={()=> this.onClickChangePage(0)}><a href="#">1</a></Z>
              <Z sel=".pagination-link" onClick={()=> this.onClickChangePage(1)}><a href="#">2</a></Z>
              <Z sel=".pagination-link" onClick={()=> this.onClickChangePage(2)}><a href="#">3</a></Z>
              <Z sel=".pagination-link" onClick={()=> this.onClickChangePage(3)}><a href="#">4</a></Z>
            </JSXZ>
          } */}
        </Z>
      </JSXZ>
    }
})

module.exports = Orders