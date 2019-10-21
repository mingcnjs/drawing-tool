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
    const { isAuthenticated } = this.props.auth;
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
          {isAuthenticated ? (
            <a href="" onClick={this.onLogout.bind(this)}>
              Logout
            </a>
          ) : (
            ""
          )}
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
