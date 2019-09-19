import axios from 'axios'
import { GET_ERRORS, GET_CUSTOMER_LIST } from './types'

export const createCustomer = (user, history) => dispatch => {
  console.log(user)
  axios
    .post('/api/customer/register', user)
    .then(res => history.push('/customer'))
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    })
}
export const getCustomerList = (user, history) => dispatch => {
  console.log(user)
  axios
    .post('/api/customer/register', user)
    .then(res => history.push('/customer'))
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    })
}
