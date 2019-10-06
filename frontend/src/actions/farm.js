import axios from 'axios'
import { GET_ERRORS,GET_FARM_LIST, GET_FARM_DATA_BACK } from './types'

export const resetErrors = () => dispatch => {
  dispatch({
    type: GET_ERRORS,
    payload: {},
  })
}

export const getFarmList = (uId) => dispatch => {
console.log(uId);
  axios
    .get(`/api/farm/${uId}`)
    .then(response => {
      dispatch({
        type: GET_FARM_LIST,
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

export const updateFarm = (id,farm) => dispatch => {
  return axios.post(`/api/farm/${id}`,farm).catch(err => {
    dispatch({
      type: GET_ERRORS,
      payload: err.response.data,
    })
    return Promise.reject()
  })
}

export const createFarm = farm => dispatch => {
  axios
    .post('/api/farm', farm)
    .then(res => {
//      const { returndata } = res
//      localStorage.setItem('jwtToken', token)
//      setAuthToken(token)
//      const decoded = jwt_decode(token)
      dispatch(getUpdateddata(res))
    })
    .catch(err => {
      dispatch({
        type: GET_ERRORS,
        payload: (err.response || { data: null }).data,
      })
    })
//console.log(farm);
//  return axios.post('/api/farm', farm).catch(err => {
//    dispatch({
//      type: GET_ERRORS,
//      payload: err.response.data,
//    })
//    return Promise.reject()
//  })
}

export const getUpdateddata = returndata => {
  return {
    type: GET_FARM_DATA_BACK,
    payload: returndata,
  }
}

