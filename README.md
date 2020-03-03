# Building

## Dependencies

Follow React native getting started for Android [here](https://reactnative.dev/docs/getting-started.html#android-development-environment).

Required versions of things:
* Node: v12.16.1

The `package.json` is checked in expecting copies of the following modules in the same directory as `twins-app`:
* Cothority, branch `twins-demo`
* `git clone -b demo https://github.com/gnarula/aries-framework-javascript.git`
* `git clone https://github.com/AbsaOSS/rn-indy-sdk`

Each one needs a slightly different process to prepare it for use:
* `cd ../cothority/external/js/cothority && npm i && npm run build`
* `cd ../aries-framework-javascript && npm i && npm pack`
* `cd ../rn-indy-sdk && yarn install && yarn build && yarn pack`

## Node Install

* `yarn install`
* `node_modules/.bin/rn-nodeify --hack --install --yarn`
* Manually remove borwser/index.js key from `node_modules/\@dedis/cothority/package.json`

## Build, install, and run

In one window, run Metro: `yarn start`

In another window, build the app and send it to your emulator: `yarn android`
