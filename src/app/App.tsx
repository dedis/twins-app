global.Buffer = global.Buffer || require('buffer').Buffer;
import React, { useEffect } from 'react';
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

// setJSExceptionHandler(async (error, isFatal) => {
//   await agentModule.getAgent().closeAndDeleteWallet();
//   throw error;
// }, true);

const App = () => {
  const theme = { ...dark, ...myTheme };

  const agent = agentModule.getAgent();
  // Set cothority logging level to verbose;
  Log.lvl = 4;

  useEffect(() => {
    return () => {
      agent.destroyEventHandlers();
    }
  })

  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={mapping} theme={theme}>
        <Provider store={store}>
          <AppNavigator screenProps={{ agent }} />
        </Provider>
      </ApplicationProvider>
    </React.Fragment>
  );
};

export default App;

