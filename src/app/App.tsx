global.Buffer = global.Buffer || require('buffer').Buffer;
import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux'
import agentModule from '../agent/agent';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import { mapping, dark } from '@eva-design/eva';
import {AppNavigator} from '../navigation/navigation.component';
import { myTheme } from './custom-theme';
import {setJSExceptionHandler } from 'react-native-exception-handler';
import { Log } from '@dedis/cothority';

import store from './store'
import { AppState, AppStateStatus } from 'react-native';

// setJSExceptionHandler(async (error, isFatal) => {
//   await agentModule.getAgent().closeAndDeleteWallet();
//   throw error;
// }, true);

const App = () => {
  const theme = { ...dark, ...myTheme };
  const appState = useRef(AppState.currentState);

  const _handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App in foreground')
      if (agentModule.initialized()) {
        const agent = agentModule.getAgent()!;
        // @ts-ignore
        agent.wallet.init().then(() => {
          console.log('Initialized wallet')
          agentModule.getAgent()!.signalRClientModule.init().then(() => {
            console.log('Started SignalR connection');
          }).catch(e => {
            console.log('Error starting SignalR connection');
          })
        })
      }
    } else if (appState.current === 'inactive' && nextAppState === 'background') {
      console.log('App going in background');
      if (agentModule.initialized()) {
        console.log('Closing SignalR connection');
        const agent = agentModule.getAgent()!;
        // @ts-ignore
        agent.wallet.close().then(() => {
          console.log('Closed wallet');
          // @ts-ignore
          agent.wallet.wh = undefined;
          agent.signalRClientModule.close();
          console.log('Closed SignalR connection');
        })
      }
    }

    appState.current = nextAppState;
    console.log('AppState', appState.current);
  }

  // Set cothority logging level to verbose;
  Log.lvl = 4;

  useEffect(() => {
    AppState.addEventListener('change', _handleAppStateChange);
    return () => {
      if (agentModule.initialized()) {
        agentModule.getAgent()!.destroyEventHandlers();
      }
      AppState.removeEventListener('change', _handleAppStateChange);
    }
  })

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <Provider store={store}>
          <AppNavigator />
        </Provider>
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;

