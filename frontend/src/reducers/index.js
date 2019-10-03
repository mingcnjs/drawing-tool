import { combineReducers } from 'redux'
import errorReducer from './errorReducer'
import authReducer from './authReducer'
import customerReducer from './customerReducer'

export default combineReducers({
  errors: errorReducer,
  auth: authReducer,
  customer: customerReducer,
})
