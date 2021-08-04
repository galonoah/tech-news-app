import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import axios from 'axios';
import Navbar from './components/Navbar';

/* Redux */
import { Provider } from 'react-redux';
import store from './store';
import { SET_AUTHENTICATED } from './types';
import { getUserData, logoutUser } from './actions/userActions';
import { getNewsData } from './actions/newsActions';

/* Pages */
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Favorites from './pages/Favorites';
import ResetPassword from './pages/ResetPassword';

/* Decode authentication Token
-------------------------------------------------- */
const token = localStorage.FBIdToken;
/**
    TODO:
    - Verify this is a valid firebase token
*/

if (token) {
  const decodedToken = jwtDecode(token);
  if (decodedToken.exp * 1000 < Date.now()) {
    store.dispatch(logoutUser());
    store.dispatch(getNewsData());
  } else {
    store.dispatch({ type: SET_AUTHENTICATED });
    axios.defaults.headers.common['Authorization'] = token;
    store.dispatch(getUserData());
  }
} else {
  store.dispatch(getNewsData());
}
/* End of Decode authentication Token
-------------------------------------------------- */

function App() {
  return (
    <React.Fragment>
      <Provider store={store}>
        <Router>
          <Navbar />
          <Switch>
            <Route exact path="/" component={Home} />
            <PrivateRoute exact path="/favorites">
              <Favorites />
            </PrivateRoute>
            <PrivateRoute exact path="/signup">
              <Signup />
            </PrivateRoute>
            <PrivateRoute exact path="/login">
              <Login />
            </PrivateRoute>
            <Route path="/forgot-password">
              <ResetPassword />
            </Route>
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>
        </Router>
      </Provider>
    </React.Fragment>
  );
}

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) => {
        const path = location.pathname;
        if (store.getState().user.authenticated) {
          return path === '/favorites' ? children : <Redirect to="/" />;
        } else {
          return path !== '/favorites' ? children : <Redirect to="/login" />;
        }
      }}
    />
  );
}

export default App;
