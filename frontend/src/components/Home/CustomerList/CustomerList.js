import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import FormModal from '../FormModal/FormModal'
import ResultCustomer from './ResultCustomer'
import './styles.css'

class CustomerList extends Component {
  listRef = null

  constructor(props) {
    super(props)
    this.state = {
      modal: false,
    }
    this.toggle = this.toggle.bind(this)
    this.onCreate = this.onCreate.bind(this)
    this.onEdit = this.onEdit.bind(this)
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal,
    }))
  }

  onCreate = () => {
    this.setState({
      modal: false,
    })
    if (this.listRef) {
      this.listRef.refresh()
    }
  }

  onEdit = currentSelectedItem => {
    if (this.modalRef) {
      this.setState({
        modal: true,
      })
      this.modalRef.show(currentSelectedItem, true)
    }
  }

  onView = currentSelectedItem => {
    console.log('onView>>>>>>>>>>>>>>>>', currentSelectedItem)
    this.props.history.push(`/farmfields/${currentSelectedItem._id}`)
  }

  render() {
    return (
      <div>
        <div className="customer-header">
          <p>My Customers</p>
        </div>
        <div className="customer-section">
          <ResultCustomer
            ref={connectedComponent => {
              if (connectedComponent) {
                this.listRef = connectedComponent.getWrappedInstance()
              }
            }}
            onEdit={this.onEdit}
            onView={this.onView}
          />

          <div className="btn-add">
            <Button
              className="btn-add-customer"
              color="primary"
              size="lg"
              onClick={() => {
                this.modalRef.show()
                this.toggle()
              }}
            >
              + Add New Customer
            </Button>
          </div>

          <FormModal
            ref={connectedComponent => {
              if (connectedComponent) {
                this.modalRef = connectedComponent.getWrappedInstance()
              }
            }}
            open={this.state.modal}
            onCreate={this.onCreate}
            onCancel={this.toggle}
          />
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
