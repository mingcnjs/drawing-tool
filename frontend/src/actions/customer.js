import axios from 'axios'
import { GET_ERRORS, GET_CUSTOMER_LIST, DELETE_CUSTOMER } from './types'

export const resetErrors = () => dispatch => {
  dispatch({
    type: GET_ERRORS,
    payload: {},
  })
}

export const createCustomer = user => dispatch => {
  return axios.post('/api/customer', user).catch(err => {
    dispatch({
      type: GET_ERRORS,
      payload: err.response.data,
    })
    return Promise.reject()
  })
}

export const updateCustomer = (id, user) => dispatch => {
  return axios.post(`/api/customer/${id}`, user).catch(err => {
    dispatch({
      type: GET_ERRORS,
      payload: err.response.data,
    })
    return Promise.reject()
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
export const deleteCustomer = customerId => dispatch => {
  return axios
    .delete(`/api/customer/${customerId}`)
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
      return Promise.reject()
    })
}
