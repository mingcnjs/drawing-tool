import axios from 'axios'
import { GET_ERRORS, GET_CUSTOMER_LIST, DELETE_CUSTOMER } from './types'

export const createCustomer = (user, history) => dispatch => {
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
export const getCustomerList = (userId, history) => dispatch => {
  axios
    .get(`/api/customer/${userId}`)
    .then(response => {
      dispatch({
        type: GET_CUSTOMER_LIST,
        payload: response.data,
      })
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    })
}
export const deleteCustomer = (userId, selected) => dispatch => {
  console.log('userId>>>>>>>', userId)
  axios
    .get(`/api/customer/`, { userId: userId, selected: selected })
    .then(response => {
      dispatch({
        type: DELETE_CUSTOMER,
        payload: response.data,
      })
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      })
    })
}
