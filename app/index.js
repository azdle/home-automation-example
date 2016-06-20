import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'

import App from './views/App'
import Login from './views/Login'
import Logout from './views/Logout'
import Signup from './views/Signup'
import Account from './views/Account'
import Devices from './views/Devices'
import Device from './views/Device'

require('./sass/styles.scss');

render((
  <Router history={hashHistory}>
    <Route path='/' component={App}>
      <IndexRoute component={Login} />
      <Route path='/login' component={Login} />
      <Route path='/logout' component={Logout} />
      <Route path='/signup' component={Signup} />
      <Route path='/account' component={Account} />
      <Route path='/devices' component={Devices} />
      <Route path='/devices/:sn' component={Device} />
    </Route>
  </Router>
), document.getElementById('app'))
