import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers
} from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { authReducer } from './store/reducers/auth';
import { profileReducer } from './store/reducers/profile';
import { contactsReducer } from './store/reducers/contacts';

const composeEnhancers =
  process.env.NODE_ENV === 'development'
    ? (window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose) ||
      compose
    : compose;

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  contacts: contactsReducer
});

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
