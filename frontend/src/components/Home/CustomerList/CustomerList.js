import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import FormModal from '../FormModal/FormModal'
import ResultCustomer from './ResultCustomer'
import './styles.css'

class CustomerList extends Component {
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
          <ResultCustomer />

          <div className="btn-add">
            <Button
              className="btn-add-customer"
              color="primary"
              size="lg"
              onClick={this.toggle}
            >
              + Add New Customer
            </Button>
          </div>

          <FormModal open={this.state.modal} toggle={this.toggle} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
})

export default connect(mapStateToProps)(CustomerList)
