import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { logoutUser } from "../../actions/authentication";
import { withRouter } from "react-router-dom";
import logo from "../../logo.png";
import "./styles.css";

class Navbar extends Component {
  onLogout(e) {
    e.preventDefault();
    this.props.logoutUser(this.props.history);
  }
  render() {
    const { isAuthenticated, user } = this.props.auth;
    const authLinks = (
      <ul className="navbar-nav ml-auto">
        <a href="" className="nav-link" onClick={this.onLogout.bind(this)}>
          <img
            src={user.avatar}
            alt={user.name}
            title={user.name}
            className="rounded-circle"
            style={{ width: "25px", marginRight: "5px" }}
          />
          Logout
        </a>
      </ul>
    );
    return (
      <div>
        <div className="nav-section" style={{ padding: 15 }}>
          <div className="nav-logo">
            <img style={{ width: 100 }} src={logo} alt="loading..." />
          </div>
          <span style={{ fontSize: "24pt" }}>GROWERS</span>
        </div>
        <div
          className="nav-logout-link"
          id="navbarSupportedContent"
          style={{ padding: "10px 30px" }}
        >
          {isAuthenticated ? authLinks : ""}
        </div>
      </div>
    );
  }
}
Navbar.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(withRouter(Navbar));
