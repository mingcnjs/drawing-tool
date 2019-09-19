import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import { registerUser } from '../../actions/authentication'
import classnames from 'classnames'
import { Button } from 'reactstrap'
import './styles.css'

class Register extends Component {
  constructor() {
    super()
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      password_confirm: '',
      growersID: '',
      retailID: '',
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
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      password: this.state.password,
      password_confirm: this.state.password_confirm,
      growersID: this.state.growersID,
      retailID: this.state.retailID,
    }
    this.props.registerUser(user)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push('/')
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      })
    }
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/')
    }
  }

  render() {
    const { errors } = this.state
    return (
      <div className="container" style={{ marginTop: '50px', width: '500px' }}>
        <h2 style={{ marginBottom: '40px' }}>Create Account</h2>
        <form onSubmit={this.handleSubmit}>
          <div className="combine-rows">
            <div className="form-group">
              <p>*First Name</p>
              <input
                type="text"
                placeholder="First Name"
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.firstName,
                })}
                name="firstName"
                onChange={this.handleInputChange}
                value={this.state.firstName}
              />
              {errors.firstName && (
                <div className="invalid-feedback">{errors.firstName}</div>
              )}
            </div>
            <div className="form-group">
              <p>*Last Name</p>
              <input
                type="text"
                placeholder="Last Name"
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.lastName,
                })}
                name="lastName"
                onChange={this.handleInputChange}
                value={this.state.lastName}
              />
              {errors.lastName && (
                <div className="invalid-feedback">{errors.lastName}</div>
              )}
            </div>
          </div>
          <div className="form-group">
            <p>*Email Address</p>
            <input
              type="email"
              placeholder="Email"
              className={classnames('form-control form-control-lg', {
                'is-invalid': errors.email,
              })}
              name="email"
              onChange={this.handleInputChange}
              value={this.state.email}
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="combine-rows">
            <div className="form-group">
              <p>*Password</p>
              <input
                type="password"
                placeholder="Password"
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.password,
                })}
                name="password"
                onChange={this.handleInputChange}
                value={this.state.password}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>
            <div className="form-group">
              <p>*Confirm Password</p>
              <input
                type="password"
                placeholder="Confirm Password"
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.password_confirm,
                })}
                name="password_confirm"
                onChange={this.handleInputChange}
                value={this.state.password_confirm}
              />
              {errors.password_confirm && (
                <div className="invalid-feedback">
                  {errors.password_confirm}
                </div>
              )}
            </div>
          </div>
          <div className="combine-rows">
            <div className="form-group">
              <p>Your Growers ID</p>
              <input
                type="text"
                placeholder="Growers ID"
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.growersID,
                })}
                name="growersID"
                onChange={this.handleInputChange}
                value={this.state.growersID}
              />
              {errors.growersID && (
                <div className="invalid-feedback">{errors.growersID}</div>
              )}
            </div>
            <div className="form-group">
              <p>Your Retail ID</p>
              <input
                type="text"
                placeholder="Retail Id"
                className={classnames('form-control form-control-lg', {
                  'is-invalid': errors.retailID,
                })}
                name="retailID"
                onChange={this.handleInputChange}
                value={this.state.retailID}
              />
              {errors.retailID && (
                <div className="invalid-feedback">{errors.retailID}</div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ textAlign: 'center' }}>
            <Button color="primary" type="submit" style={{ width: '200px' }}>
              Create Account
            </Button>
            <Link
              className="nav-link"
              to="/login"
              style={{ textDecoration: 'underline' }}
            >
              LogIn
            </Link>
          </div>
        </form>
      </div>
    )
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
})

export default connect(
  mapStateToProps,
  { registerUser },
)(withRouter(Register))
