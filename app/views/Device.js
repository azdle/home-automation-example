import React from 'react'
import { hashHistory } from 'react-router'
import { Link } from 'react-router'
import Form from 'muicss/lib/react/form'
import Button from 'muicss/lib/react/button'
import Input from 'muicss/lib/react/input'
import Spinner from '../components/spinner'
import ShareDevicebulbForm from '../components/share_device_form'
import { toggleDeviceState, attemptShare, attemptDeleteDevice } from '../actions/devices'
import { logout } from '../actions/auth'

import FlatButton from 'material-ui/lib/flat-button';
import AppBar from 'material-ui/lib/app-bar';
import IconButton from 'material-ui/lib/icon-button';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Popover from 'material-ui/lib/popover/popover';
import RaisedButton from 'material-ui/lib/raised-button';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import RouterIcon from 'material-ui/lib/svg-icons/device/data-usage';
import AddIcon from 'material-ui/lib/svg-icons/content/add';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionHome from 'material-ui/lib/svg-icons/action/home';
import ChevronLeft from 'material-ui/lib/svg-icons/navigation/chevron-left';
import Share from 'material-ui/lib/svg-icons/social/share';
import NotificationsActive from 'material-ui/lib/svg-icons/social/notifications-active';
import Delete from 'material-ui/lib/svg-icons/action/delete';
import Colors from 'material-ui/lib/styles/colors';

export default React.createClass({
  contextTypes: {
    store: React.PropTypes.object
  },

  componentWillMount() {
    let state = this.context.store.getState();

    this.unsubscribe = this.context.store.subscribe(() => {
      if (state.devices.statuses.filter(v => v.serialnumber == this.props.params.sn).length == 0) {
        hashHistory.push('/devices')
      }

      // FIXME: This is probably the wrong way to do this.
      if (state.auth.session === undefined) {
        hashHistory.push('/login')
      }
      // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`

    })
    this.forceUpdate()
  },

  componentWillUnmount () {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
  },

  handleShare (r) {
    attemptShare(r.email, this.props.params.sn)(this.context.store.dispatch)
  },

  handleDelete (r) {
    attemptDeleteDevice(this.props.params.sn)(this.context.store.dispatch,this.context.store.getState)
  },

  /**
   * TODO: this can't the right way to handle logging out...
   */
  handleLogout (event) {
    event.preventDefault();

    logout()(this.context.store.dispatch);

    hashHistory.push('/login');

    this.forceUpdate();
  },

  render() {
    let spinner_when_waiting = (
      this.context.store.getState().devices.isFetching
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    );

    let error_message = (
      this.context.store.getState().auth.error == null
      ? <div></div>
      : <div className='messagebox error'>{this.context.store.getState().auth.error}</div>
    );

    const mainAppMoreMenu = (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon/></IconButton>}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}} >
        <MenuItem onTouchStart={this.handleLogout}
                  onMouseUp={this.handleLogout}
                  primaryText="Logout" />
      </IconMenu>
    );

    let state = this.context.store.getState();

    let device = state.devices.statuses.find(lb => lb.serialnumber === this.props.params.sn);
    let deviceName = device === undefined ? "" : device.serialnumber

    let iconStyle = {
      top: 16
    };

    //let shares = state.devices.shares.filter(v => v.serialnumber == this.props.params.sn);
    let shares = [];
    let sharesList = (
      (shares.length > 0) ?
        shares.map((v) => {
          return (
            <ListItem leftAvatar={ <Share style={iconStyle} /> }
                      primaryText={ v.email }
                      rightIconButton={<IconButton><Delete style={iconStyle} /></IconButton>} /> )
        }) :
        ( <ListItem primaryText="Not yet shared." /> )
    );

    //let alerts = state.devices.alerts.filter(v => v.serialnumber == this.props.params.sn);
    let alerts = [];
    let alertsList = (
      (alerts.length > 0) ?
        alerts.map((v) => {
          return (
            <ListItem leftAvatar={ <NotificationsActive style={iconStyle} /> }
                      primaryText={ v.name }
                      rightIconButton={<IconButton><Delete style={iconStyle} /></IconButton>} /> )
        }) :
        ( <ListItem primaryText="No alerts created." /> )
    );

    const rightIconMenu = (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon color={Colors.grey400} /></IconButton>}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
        targetOrigin={{horizontal: 'right', vertical: 'top'}} >
        <MenuItem primaryText="Turn on" />
        <MenuItem primaryText="Add Alert" />
        <MenuItem primaryText="Share" />
        <MenuItem primaryText="Edit" />
        <MenuItem primaryText="Delete" />
      </IconMenu>
    );

    const main_content = (

      device === undefined
      ? <div>Unknown Error</div>
      : <div>
        <List subheader="Data">
          <ListItem leftIcon={<RouterIcon />}
                    primaryText="Temperature"
                    secondaryText="5°C"
                    disabled={true} />
          <ListItem leftIcon={<RouterIcon />}
                    primaryText="Humidity"
                    secondaryText="63%"
                    disabled={true} />
          <ListItem leftIcon={<RouterIcon />}
                    primaryText="Uptime"
                    secondaryText="6453456"
                    disabled={true} />
          <ListItem leftIcon={<RouterIcon />}
                    primaryText="Message"
                    secondaryText="Hello, world!"
                    disabled={true} />
        </List>

        <List subheader="Shared with">
          { sharesList }
          <ListItem leftIcon={<AddIcon />}
                    primaryText="Share"
                    onClick={() => alert("Not Yet Implemented")} />
        </List>

        <List subheader="Alerts">
          { alertsList }
          <ListItem leftIcon={<AddIcon />}
                    primaryText="Create Alert"
                    onClick={() => alert("Not Yet Implemented")} />
        </List>

        <List subheader="Settings">
          <ListItem leftIcon={<AddIcon />}
                    primaryText="Delete"
                    onClick={() => alert("Not Yet Implemented")/*this.handleDelete*/} />
        </List>
      </div>
    )

    return (
      <div>
        <AppBar title={deviceName}
                iconElementRight={ mainAppMoreMenu }
                iconElementLeft={ <IconButton onClick={()=> hashHistory.push("/devices")}><ChevronLeft /></IconButton> } />

        {main_content}

      </div>
    )
  }
})
