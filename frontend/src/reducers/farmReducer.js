import { GET_FARM_DATA_BACK,GET_FARM_LIST } from '../actions/types'

const initialState = {
//  isAuthenticated: false,
  getFarms: {},
}

export default function(state = initialState, action) {
  switch (action.type) {
    case GET_FARM_DATA_BACK:
      return {
        ...state,
//        isAuthenticated: !isEmpty(action.payload),
        getFarms: action.payload,
      }
    case GET_FARM_LIST:
      return {
        ...state,
//        isAuthenticated: !isEmpty(action.payload),
        getFarmsList: action.payload,
      }

    default:
      return state
  }
}
