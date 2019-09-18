import React, { Component } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './store'
import jwt_decode from 'jwt-decode'
import setAuthToken from './setAuthToken'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core'
import { setCurrentUser, logoutUser } from './actions/authentication'

import Navbar from './components/Navbar/Navbar'
import Register from './components/Register/Register'
import Login from './components/Login/Login'
import CustomerList from './components/Home/CustomerList/CustomerList'
import baseTheme from './baseTheme'

import 'bootstrap/dist/css/bootstrap.min.css'

if (localStorage.jwtToken) {
  setAuthToken(localStorage.jwtToken)
  const decoded = jwt_decode(localStorage.jwtToken)
  store.dispatch(setCurrentUser(decoded))

  const currentTime = Date.now() / 1000
  if (decoded.exp < currentTime) {
    store.dispatch(logoutUser())
    window.location.href = '/login'
  }
}

class App extends Component {
  render() {
    const theme = createMuiTheme({ ...baseTheme })
    return (
      <Provider store={store}>
        <Router>
          <MuiThemeProvider theme={theme}>
            <div>
              <Navbar />
              <Route exact path="/" component={CustomerList} />
              <div className="container">
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
              </div>
            </div>
          </MuiThemeProvider>
        </Router>
      </Provider>
    )
  }
}

export default App
