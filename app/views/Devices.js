import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router'
import { Link } from 'react-router'
import FloatingActionButton from 'material-ui/lib/floating-action-button';
import Spinner from '../components/spinner'
import AddDeviceForm from '../components/add_device_form'
import { attemptToggleDeviceState, attemptAddDevice, requestDevices } from '../actions/devices'
import Container from 'muicss/lib/react/container';
import { logout } from '../actions/auth'
import { connect } from 'react-redux'


import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import AppBar from 'material-ui/lib/app-bar';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionInfo from 'material-ui/lib/svg-icons/action/info';
import Divider from 'material-ui/lib/divider';
import Avatar from 'material-ui/lib/avatar';
import DeviceIcon from 'material-ui/lib/svg-icons/hardware/router';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import Colors from 'material-ui/lib/styles/colors';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';
import IconButton from 'material-ui/lib/icon-button';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Popover from 'material-ui/lib/popover/popover';

// Test 
import { bindActionCreators } from 'redux'

function mapStateToProps(state) {
  return { 
    error: state.devices.error,
    statuses: state.devices.statuses
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { attemptToggleDeviceState, attemptAddDevice, requestDevices }, 
    dispatch)
}

let DevicesView = React.createClass({

  contextTypes: {
    store: React.PropTypes.object
  },

  getInitialState() {
    return {
      deviceModalOpen: false
    }
  },

  showDeviceModal() {
    this.setState({deviceModalOpen: true});
  },

  closeDeviceModal() {
    this.setState({deviceModalOpen: false});
  },

  handleAddDevice(request) {
    attemptAddDevice(request.sn)(this.context.store.dispatch, this.context.store.getState)
    this.closeDeviceModal();
  },

  /**
   * TODO: this can't the right way to handle logging out...
   */
  handleLogout (event) {
    event.preventDefault();

    logout()(this.context.store.dispatch)

    browserHistory.push('/login')

    this.forceUpdate()
  },

  componentWillMount() {
    let state = this.context.store.getState()

    // FIXME: This is probably the wrong way to do this.
    if (state.auth.session === undefined) {
      browserHistory.push('/login')
      return
    }

    this.forceUpdate()

    //this.unsubscribe = this.context.store.subscribe(() => {
    //  // FIXME: This is definitely the wrong way to do this, use react-redux's `connect`
    //  this.forceUpdate()
    //})
    //
    //// TODO: replace all these calls with redux-thunk
    requestDevices()(this.context.store.dispatch, this.context.store.getState)

    
    this.pollInterval = 1000
    this.updateStatuses()

    //window.addEventListener("blur", this.onblur)
    //window.addEventListener("focus", this.onfocus)
  },

  //onblur () {
  //  this.pollInterval = 10000
  //},
  //
  //onfocus () {
  //  this.pollInterval = 1000
  //  this.updateStatuses()
  //},

  updateStatuses () {
    let state = this.context.store.getState()
    if (state.devices.isFetching == false) {
      requestDevices()(this.context.store.dispatch, this.context.store.getState)
    }
  
   this.pollTimer = window.setTimeout(() => {
     this.updateStatuses()
   }, this.pollInterval)
  },

  componentWillUnmount() {
    if (typeof this.unsubscribe == "function") { this.unsubscribe() }
    if (this.pollTimer != undefined) { window.clearTimeout(this.pollTimer); this.pollTimer = undefined}

    window.removeEventListener("blur", this.onblur)
    window.removeEventListener("focus", this.onfocus)
  },
  propTypes: {
    error: PropTypes.string,
    devices: PropTypes.arrayOf(PropTypes.shape({
      serialnumber: PropTypes.string.isRequired,
      state: PropTypes.number.isRequired
    }))
  },
  getDefaultProps() {
    return {
      error: '',
      statuses: []
    }
  },
  render() {
    let spinner_when_waiting = (
      this.context.store.getState().devices.isFetching && this.context.store.getState().devices.statuses.length == 0
      ? <Spinner />
      : <Spinner style={{visibility: "hidden"}} />
    )

    let devices_error = this.props.error; // this.context.store.getState().devices.error
    console.log('devices_error during render() is:', devices_error);
    let error_message = (
      devices_error == null
      ? <div></div>
      : <div className='messagebox error'>{devices_error}</div>
    );

    let info_message_when_none = (
      this.context.store.getState().devices.statuses.length === 0
      ? <div className='messagebox info'>You do not have any devices. <a href="javascript: void(0);" onMouseDown={this.showDeviceModal}>+ New Device</a></div>
      : <div></div>
    );

    let appBarStyle = {
      backgroundColor: '#ffffff'
    };

    let state = this.context.store.getState();

    const actionButtonStyle = {
      'float': 'right',
      color: '#FF9300',
      marginRight: 20,
      marginTop: -10,
      marginBottom:30
    };


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

    return (
      <div>
        <AppBar title="Device List"
                iconElementRight={ mainAppMoreMenu }
                showMenuIconButton={false}  />

        <Container>
          {error_message}
          {info_message_when_none}
          <List>
          {state.devices.statuses.sort((a,b) => a.serialnumber > b.serialnumber).map( (m,i) => {
            const link = '/devices/' + m.serialnumber
            return (
              <Link to={link}>
                <ListItem leftAvatar={<DeviceIcon />}
                          primaryText={m.name}
                          secondaryText={m.serialnumber}
                          className="bulb-list-item" />
              </Link>
            )
            })}
          </List>
        </Container>

        <FloatingActionButton
          onMouseDown={this.showDeviceModal}
          mini={false}
          style={actionButtonStyle}>
          <ContentAdd />
        </FloatingActionButton>

        <Dialog
          title="Add Device"
          contentStyle={{ maxWidth: 400 }}
          modal={true}
          open={this.state.deviceModalOpen}
          onRequestClose={this.closeDeviceModal} >

          <AddDeviceForm onSubmit={this.handleAddDevice} isLoading={state.devices.isAdding} />
        </Dialog>
       </div>
    )
  }
})


export default connect(mapStateToProps, mapDispatchToProps)(DevicesView);


//const rightIconMenu = (
//  <IconMenu
//    iconButtonElement={<IconButton><MoreVertIcon color={Colors.grey400} /></IconButton>}
//    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
//    targetOrigin={{horizontal: 'right', vertical: 'top'}} >
//    <MenuItem primaryText="Turn on" />
//    <MenuItem primaryText="Add Alert" />
//    <MenuItem primaryText="Share" />
//    <MenuItem primaryText="Edit" />
//    <MenuItem primaryText="Delete" />
//  </IconMenu>
//);
