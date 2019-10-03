import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import logger from 'redux-logger'

const inititalState = {}

const enhancer = window.__REDUX_DEVTOOLS_EXTENSION__
  ? compose(
      applyMiddleware(thunk, logger),
      window.__REDUX_DEVTOOLS_EXTENSION__(),
    )
  : applyMiddleware(thunk, logger)

const store = createStore(rootReducer, inititalState, enhancer)

export default store
