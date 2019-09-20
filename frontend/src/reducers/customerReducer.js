import { GET_CUSTOMER_LIST } from '../actions/types'
import isEmpty from '../validation/is-empty'

const initialState = {
  isAuthenticated: false,
  getCustomers: {},
}

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_CUSTOMER_LIST:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        getCustomers: action.payload,
      }
    default:
      return state
  }
}
