import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { createCustomer } from '../../../actions/customer'
import classnames from 'classnames'
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
} from 'reactstrap'
class FormModal extends React.Component {
  constructor() {
    super()
    this.state = {
      operationName: '',
      farmerEmail: '',
      farmerName: '',
      growerCustomerNumber: '',
      errors: {},
    }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }
  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  handleSubmit(e) {
    e.preventDefault()
    const user = {
      userId: this.props.auth.user.id,
      operationName: this.state.operationName,
      farmerEmail: this.state.farmerEmail,
      farmerName: this.state.farmerName,
      growerCustomerNumber: this.state.growerCustomerNumber,
    }

    this.props.createCustomer(user, this.props.history)
    if (!this.props.errors) {
      this.props.toggle()
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      })
    }
  }
  render() {
    const { open, toggle } = this.props
    const { errors } = this.state
    return (
      <Modal
        isOpen={open}
        toggle={toggle}
        className="modal-style"
        style={{
          border: 'none',
          marginTop: '200px',
          width: '498px',
        }}
      >
        <ModalHeader>Create New Customer</ModalHeader>
        <ModalBody style={{ border: 'none' }}>
          <FormGroup>
            <Label for="operationName">Farming Operation Name</Label>
            <Input
              type="text"
              name="operationName"
              id="operationName"
              placeholder="Farming Operation Name"
              className={classnames('form-control form-control-lg', {
                'is-invalid': errors.operationName,
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
              className={classnames('form-control form-control-lg', {
                'is-invalid': errors.farmerName,
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
              className={classnames('form-control form-control-lg', {
                'is-invalid': errors.farmerEmail,
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
              className={classnames('form-control form-control-lg', {
                'is-invalid': errors.growerCustomerNumber,
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
        <ModalFooter style={{ border: 'none' }}>
          <Button color="primary" onClick={toggle}>
            Cancel
          </Button>{' '}
          <Button color="success" onClick={this.handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </Modal>
    )
  }
}

FormModal.propTypes = {
  createCustomer: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
}
const mapDispatchToProps = dispatch => {
  return {
    createCustomer: (user, history) => dispatch(createCustomer(user, history)),
  }
}
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
})
export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(FormModal))
