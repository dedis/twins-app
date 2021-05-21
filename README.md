# Building

## Configuring

Please refer to `src/app/config.ts` for configuration options.

## Dependencies

Follow React native getting started for Android [here](https://reactnative.dev/docs/getting-started.html#android-development-environment).

Required versions of things:
* Node: v12.16.1

### rn-indy-sdk

Please follow the iOS instructions for rn-indy-sdk at https://github.com/AbsaOSS/rn-indy-sdk#ios to set up the dependencies in XCode.

## Node Install

* `yarn install`

## Build, install, and run

In one window, run Metro: `yarn start`

In another window, build the app and send it to your emulator: `yarn android`

## Publishing the App

### Archiving the App

Open `ios/EdgeAgent.xcworkspace` in Xcode and then build the archive by clicking on `Product -> Archive`.

### Distributing the App via TestFlight

You may view all the archives by clicking on `Window -> Organizer` and then publish an archive by selecting it and clicking on `Distribute App`

On the window that pops up, select `App Store Connect`, `Upload`, Check the box to receive crash reports, `Automatically manage signing` and finally click on `Upload`.

Please visit [https://appstoreconnect.apple.com/](https://appstoreconnect.apple.com/), login with your work AppleID, click on `My Apps`, `TWINS`, `TestFlight`, expand the version and click on build number you published. You may then invite people by entering their AppleIDs in Individual Testers form.
