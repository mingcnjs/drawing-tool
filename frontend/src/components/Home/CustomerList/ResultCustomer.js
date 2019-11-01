import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getCustomerList,
  deleteCustomer,
  sendBoundaries
} from "../../../actions/customer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import { getFarmList } from "../../../actions/farm";
import "./styles.css";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input
} from "reactstrap";
import { toast } from "react-toastify";
import ReactTags from "react-tag-autocomplete";

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

class ResultCustomer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      customerDatas: [],
      checkStatus: false,
      selected: [],
      receivers: [],

      sendBoundariesModalVisible: false,
      message: ""
    };
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
    this.refresh = this.refresh.bind(this);
  }

  componentDidMount() {
    this.props.getCustomerList(this.props.auth.user.id);
  }

  refresh = () => {
    this.setState({
      selected: []
    });
    this.props.getCustomerList(this.props.auth.user.id);
  };

  handleClick(name) {
    const { selected } = this.state;
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    this.setState({
      selected: newSelected
    });
  }

  delete() {
    if (this.state.selected.length > 0) {
      Promise.all(
        this.state.selected.map(customerId => {
          return this.props.deleteCustomer(customerId);
        })
      ).then(() => {
        this.refresh();
      });
    }
  }

  sendToGrowers = item => {
    this.setState({
      sendBoundariesModalVisible: true,
      sendBoundariesItem: item,
      receivers: [
        {
          id: 1,
          name: item.farmerEmail
        }
      ]
    });
  };

  edit(item) {
    this.props.onEdit(item);
  }

  view(item) {
    this.props.onView(item);
  }

  render() {
    const { customer } = this.props;
    const { selected } = this.state;
    const isSelected = name => selected.indexOf(name) !== -1;
    return (
      <div>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Farming Operation Name</TableCell>
              <TableCell>Farmer Name</TableCell>
              <TableCell>Email Address</TableCell>
              <TableCell>Growsers ID</TableCell>
              <TableCell style={{ width: 380 }}>Operations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customer &&
              Object.values(customer).map((row, i) => {
                const isItemSelected = isSelected(row._id);
                const labelId = `enhanced-table-checkbox-${i}`;
                return (
                  <TableRow
                    hover
                    onClick={event => this.handleClick(row._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row._id}
                    selected={isItemSelected}
                  >
                    <TableCell key={i}>
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.operationName}
                    </TableCell>
                    <TableCell>{row.farmerName}</TableCell>
                    <TableCell>{row.farmerEmail}</TableCell>
                    <TableCell>{row.growerCustomerNumber}</TableCell>
                    <TableCell>
                      <Button
                        className="btn-edit-customer"
                        color="primary"
                        size="sm"
                        onClick={() => this.edit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        style={{ marginLeft: 10 }}
                        className="btn-edit-customer"
                        color="primary"
                        size="sm"
                        onClick={() => this.view(row)}
                      >
                        View Options
                      </Button>
                      <Button
                        style={{ marginLeft: 10 }}
                        className="btn-edit-customer"
                        color="primary"
                        size="sm"
                        onClick={() => this.sendToGrowers(row)}
                      >
                        Send Boundaries to Growers
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <div className="btn-sub-group">
          <Button
            className="btn-delete-customer"
            color="danger"
            size="sm"
            onClick={this.delete}
            disabled={this.state.selected.length === 0}
          >
            Delete
          </Button>
        </div>
        <Modal
          isOpen={this.state.sendBoundariesModalVisible}
          toggle={() => {
            this.setState({
              sendBoundariesModalVisible: false
            });
          }}
          className="modal-style"
          style={{
            border: "none",
            marginTop: "200px",
            width: "498px"
          }}
        >
          <ModalHeader>Send Boundaries to Growers</ModalHeader>
          <ModalBody style={{ border: "none" }}>
            <FormGroup>
              <Label for="message">Message</Label>
              <Input
                type="text"
                name="message"
                id="message"
                placeholder="Type something"
                onChange={e => {
                  this.setState({
                    message: e.target.value
                  });
                }}
                value={this.state.message}
              />
            </FormGroup>
            <FormGroup>
              <Label for="message">Receivers(email)</Label>
              <ReactTags
                id="message"
                tags={this.state.receivers}
                suggestions={[]}
                allowNew={true}
                handleDelete={index => {
                  const receivers = [...this.state.receivers];
                  receivers.splice(index, 1);
                  this.setState({
                    receivers
                  });
                }}
                handleAddition={tag => {
                  if (validateEmail(tag.name)) {
                    this.setState({
                      receivers: [...this.state.receivers, tag]
                    });
                  }
                }}
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter style={{ border: "none" }}>
            {this.state.receivers.length > 0 && (
              <Button
                color="success"
                style={{ marginRight: 10 }}
                onClick={() => {
                  if (this.state.sendBoundariesItem) {
                    this.props
                      .sendBoundaries(
                        this.state.sendBoundariesItem._id,
                        this.state.message,
                        this.state.receivers.map(r => r.name)
                      )
                      .then(() => {
                        toast.success(`Success. Boundaries sent to Growers`);
                        this.setState({
                          sendBoundariesModalVisible: false
                        });
                      });
                  }
                }}
              >
                Send
              </Button>
            )}
            <Button
              color="primary"
              onClick={() => {
                this.setState({
                  sendBoundariesModalVisible: false
                });
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  customer: state.customer.getCustomers
});

const mapDispatchToProps = {
  getCustomerList,
  deleteCustomer,
  getFarmList,
  sendBoundaries
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true }
)(ResultCustomer);
