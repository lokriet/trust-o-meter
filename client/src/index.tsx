import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { authReducer } from './store/reducers/auth';
import { contactsReducer } from './store/reducers/contacts';
import { profileReducer } from './store/reducers/profile';
import { statusReducer } from './store/reducers/status';

const composeEnhancers =
  process.env.NODE_ENV === 'development'
    ? (window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] as typeof compose) ||
      compose
    : compose;

const rootReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  contacts: contactsReducer,
  status: statusReducer
});

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
