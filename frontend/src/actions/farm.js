import axios from 'axios'
import { GET_ERRORS } from './types'

export const resetErrors = () => dispatch => {
  dispatch({
    type: GET_ERRORS,
    payload: {},
  })
}

export const createFarm = farm => dispatch => {
console.log(farm);
  return axios.post('/api/farm', farm).catch(err => {
    dispatch({
      type: GET_ERRORS,
      payload: err.response.data,
    })
    return Promise.reject()
  })
}
