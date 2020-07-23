# Building

## Configuring

Edit the following to configure the system:
* src/App.tsx to set the mediator URL, which you get from ngrok
* src/App.tsx to set the ByzcoinID, which you get from setting up Odyssey
* src/roster.ts to set the roster, which you get from setting up Odyssey (from conode/public.toml, but be careful to
modify the IP address from localhost to 10.0.2.2 to match what Android needs)

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

## Build, install, and run

In one window, run Metro: `yarn start`

In another window, build the app and send it to your emulator: `yarn android`


## Cleanup todo items

These are things Jeff knows about and needs to come back to.

* aries-framework-javascript: Run npm audit and update
* update Indy sdk binaries
* react autolink:
```
error React Native CLI uses autolinking for native dependencies, but the following modules are linked manually: 
  - react-native-randombytes (to unlink run: "react-native unlink react-native-randombytes")
This is likely happening when upgrading React Native from below 0.60 to 0.60 or above. Going forward, you can unlink this dependency via "react-native unlink <dependency>" and it will be included in your app automatically. If a library isn't compatible with autolinking, disregard this message and notify the library maintainers.
```
