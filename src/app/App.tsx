global.Buffer = global.Buffer || require('buffer').Buffer;
import React from 'react';
import { Provider } from 'react-redux'
import agent from '../agent/agent';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import { mapping, dark } from '@eva-design/eva';
import {AppNavigator} from '../navigation/navigation.component';
import { myTheme } from './custom-theme';
import { Connections } from '../navigation/connections.component';
import { Notification } from '../navigation/notification.component';

import store from './store'


const App = () => {

  const [connectionState, setConnectionState] = React.useState<Connections[]>([]);
  const [notificationState, setNotificationState] = React.useState<Notification[]>([]);
  const [listenerState, setListenerState] = React.useState<boolean>(false);

  const theme = { ...dark, ...myTheme };

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <Provider store={store}>
          <AppNavigator screenProps={{ agent, connectionState, setConnectionState, notificationState, setNotificationState, listenerState, setListenerState }} />
        </Provider>
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;

