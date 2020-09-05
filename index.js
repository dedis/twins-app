/**
 * @format
 */

delete global.URLSearchParams;
delete global.URL;
const pollyfillGlobal = require('react-native/Libraries/Utilities/PolyfillFunctions').polyfillGlobal;
pollyfillGlobal('URL', () => require('whatwg-url').URL);
pollyfillGlobal('URLSearchParams', () => require('whatwg-url').URLSearchParams);
global.URL = require('whatwg-url').URL;
global.URLSearchParams = require('whatwg-url').URLSearchParams;

import './shim';

import {AppRegistry} from 'react-native';
import App from './src/app/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
