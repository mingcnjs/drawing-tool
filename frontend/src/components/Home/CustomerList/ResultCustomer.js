import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getCustomerList, deleteCustomer } from '../../../actions/customer'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Checkbox from '@material-ui/core/Checkbox'
import { Button } from 'reactstrap'
import './styles.css'

class ResultCustomer extends Component {
  constructor(props) {
    super(props)
    this.state = {
      customerDatas: [],
      checkStatus: false,
      selected: [],
    }
    this.delete = this.delete.bind(this)
    this.edit = this.edit.bind(this)
    this.refresh = this.refresh.bind(this)
  }

  componentDidMount() {
    this.props.getCustomerList(this.props.auth.user.id)
  }

  refresh = () => {
    this.setState({
      selected: [],
    })
    this.props.getCustomerList(this.props.auth.user.id)
  }

  handleClick(event, name) {
    const { selected } = this.state
    const selectedIndex = selected.indexOf(name)
    let newSelected = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      )
    }
    this.setState({
      selected: newSelected,
    })
  }

  delete() {
    console.log('this.state.selected', this.state.selected)
    if (this.state.selected.length > 0) {
      Promise.all(
        this.state.selected.map(customerId => {
          return this.props.deleteCustomer(customerId)
        }),
      ).then(() => {
        this.refresh()
      })
    }
  }

  edit(item) {
    this.props.onEdit(item)
  }

  view(item) {
    this.props.onView(item)
  }

  render() {
    const { customer } = this.props
    const { selected } = this.state
    const isSelected = name => selected.indexOf(name) !== -1
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
              <TableCell>Operations</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customer &&
              Object.values(customer).map((row, i) => {
                const isItemSelected = isSelected(row._id)
                const labelId = `enhanced-table-checkbox-${i}`
                return (
                  <TableRow
                    hover
                    onClick={event => this.handleClick(event, row._id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row._id}
                    selected={isItemSelected}
                  >
                    <TableCell key={i}>
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
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
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
        <div className="btn-sub-group">
          <Button
            className="btn-delete-customer"
            color="primary"
            size="sm"
            onClick={this.delete}
            disabled={this.state.selected.length === 0}
          >
            Delete
          </Button>
          <Button className="btn-send-customer" color="primary" size="sm">
            Send Boundaries to Growers
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  customer: state.customer.getCustomers,
})

const mapDispatchToProps = {
  getCustomerList,
  deleteCustomer,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  null,
  { withRef: true },
)(ResultCustomer)
