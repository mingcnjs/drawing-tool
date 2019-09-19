import React, { Component } from 'react'
import { Button } from 'reactstrap'
import FormModal from '../FormModal/FormModal'
import './styles.css'

export default class CustomerList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      modal: false,
    }
    this.toggle = this.toggle.bind(this)
  }
  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal,
    }))
  }
  render() {
    return (
      <div>
        <div className="customer-header">
          <p>My Customers</p>
        </div>
        <div className="customer-section">
          <Button
            className="btn-add-customer"
            color="primary"
            size="lg"
            onClick={this.toggle}
          >
            + Add New Customer
          </Button>
          <FormModal open={this.state.modal} toggle={this.toggle} />
        </div>
      </div>
    )
  }
}
