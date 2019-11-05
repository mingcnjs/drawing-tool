import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  createCustomer,
  updateCustomer,
  resetErrors
} from "../../../actions/customer";
import classnames from "classnames";
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

class FormModal extends React.Component {
  constructor() {
    super();
    this.state = {
      operationName: "",
      farmerEmail: "",
      farmerName: "",
      growerCustomerNumber: "",
      errors: {},
      editable: false
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.show = this.show.bind(this);
  }

  show(data, editable) {
    this.props.resetErrors();
    if (data) {
      const {
        _id,
        operationName,
        farmerEmail,
        farmerName,
        growerCustomerNumber
      } = data;
      this.setState({
        operationName,
        farmerEmail,
        farmerName,
        growerCustomerNumber,
        editable,
        currentEditingId: _id
      });
    } else {
      this.setState({
        operationName: "",
        farmerEmail: "",
        farmerName: "",
        growerCustomerNumber: "",
        editable: true,
        currentEditingId: undefined
      });
    }
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    const user = {
      operationName: this.state.operationName,
      farmerEmail: this.state.farmerEmail,
      farmerName: this.state.farmerName,
      growerCustomerNumber: this.state.growerCustomerNumber
    };

    Promise.resolve()
      .then(() => {
        if (this.state.currentEditingId) {
          return this.props.updateCustomer(this.state.currentEditingId, user);
        } else {
          return this.props.createCustomer({
            ...user,
            userId: this.props.auth.user.id
          });
        }
      })
      .then(() => {
        this.props.onCreate();
        if (this.state.currentEditingId) {
          toast.success(`Success. ${this.state.operationName} was updated`);
        } else {
          toast.success(`Success. ${this.state.operationName} was created`);
        }
      });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      });
    }
  }

  render() {
    const { open, onCancel } = this.props;
    const { errors } = this.state;
    return (
      <Modal
        isOpen={open}
        toggle={onCancel}
        className="modal-style"
        style={{
          border: "none",
          marginTop: "200px",
          width: "498px"
        }}
      >
        <ModalHeader>Create New Customer</ModalHeader>
        <ModalBody style={{ border: "none" }}>
          <FormGroup>
            <Label for="operationName">Farming Operation Name</Label>
            <Input
              type="text"
              name="operationName"
              id="operationName"
              placeholder="Farming Operation Name"
              className={classnames("form-control form-control-lg", {
                "is-invalid": errors.operationName
              })}
              onChange={this.handleInputChange}
              value={this.state.operationName}
            />
            {errors.operationName && (
              <div className="invalid-feedback">{errors.operationName}</div>
            )}
            <Label for="farmerName">Farmer Name</Label>
            <Input
              type="text"
              name="farmerName"
              id="farmerName"
              placeholder="Farmer Name"
              className={classnames("form-control form-control-lg", {
                "is-invalid": errors.farmerName
              })}
              onChange={this.handleInputChange}
              value={this.state.farmerName}
            />
            {errors.farmerName && (
              <div className="invalid-feedback">{errors.farmerName}</div>
            )}
            <Label for="farmerEmail">Farmer Email Address</Label>
            <Input
              type="email"
              name="farmerEmail"
              id="farmerEmail"
              placeholder="Email Address"
              className={classnames("form-control form-control-lg", {
                "is-invalid": errors.farmerEmail
              })}
              onChange={this.handleInputChange}
              value={this.state.farmerEmail}
            />
            {errors.farmerEmail && (
              <div className="invalid-feedback">{errors.farmerEmail}</div>
            )}
            <Label for="growerCustomerNumber">Growers.ag Customer Number</Label>
            <Input
              type="text"
              name="growerCustomerNumber"
              id="growerCustomerNumber"
              placeholder="Grower Customer Number"
              className={classnames("form-control form-control-lg", {
                "is-invalid": errors.growerCustomerNumber
              })}
              onChange={this.handleInputChange}
              value={this.state.growerCustomerNumber}
            />
            {errors.growerCustomerNumber && (
              <div className="invalid-feedback">
                {errors.growerCustomerNumber}
              </div>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter style={{ border: "none" }}>
          {this.state.editable && (
            <Button
              style={{ marginRight: 10 }}
              color="success"
              onClick={this.handleSubmit}
            >
              Submit
            </Button>
          )}
          <Button color="primary" onClick={onCancel}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

FormModal.propTypes = {
  createCustomer: PropTypes.func.isRequired,
  updateCustomer: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

const mapDispatchToProps = {
  createCustomer,
  updateCustomer,
  resetErrors
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true }
)(FormModal);
