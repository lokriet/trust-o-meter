/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import './index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';

import App from './App';
import { ErrorBoundary } from './hoc/ErrorBoundary';
import * as serviceWorker from './serviceWorker';
import { authReducer } from './store/reducers/auth';
import { contactsReducer } from './store/reducers/contacts';
import { notificationsReducer } from './store/reducers/notifications';
import { profileReducer } from './store/reducers/profile';
import { socketReducer } from './store/reducers/socket';
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
  status: statusReducer,
  notifications: notificationsReducer,
  socket: socketReducer
});

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

ReactDOM.render(
  <Provider store={store}>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
