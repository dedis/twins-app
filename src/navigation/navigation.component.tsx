import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { HomeScreen } from './home.component';
import { ScanScreen } from './scan.component';
import { ConnectionsScreen } from './connections/connections.component';
import { TabBarComponent } from './tabbar.component';
import messaging from './messaging';
import { NotificationScreen } from './notifications/notification.component';
import { ConsentRequestScreen } from './consentrequest.component';
import { ConsentInviteScreen } from './notifications/consentinvite.component';
import { ConsentInformationRequestScreen } from './notifications/consentinformationrequest.component';
import { SecretShareScreen } from './secretshare.component';
import { ShareQRCodeScreen } from './shareqrcode.component';

const connectionStack = createStackNavigator({
  Connections: ConnectionsScreen,
  Chat: messaging,
}, {
  initialRouteName: 'Connections',
  headerMode: 'none',
});

const homeStack = createStackNavigator({
  Home: HomeScreen,
  Scan: ScanScreen,
  SecretShare: SecretShareScreen,
  ShareQRCode: ShareQRCodeScreen,
}, {
  initialRouteName: 'Home',
  headerMode: 'none',
});

const notificationStack = createStackNavigator({
  Notifications: NotificationScreen,
  ConsentInvite: ConsentInviteScreen,
  ConsentInformationRequest: ConsentInformationRequestScreen,
}, {
  initialRouteName: 'Notifications',
  headerMode: 'none'
})

const TabNavigator = createBottomTabNavigator({
  Home: homeStack,
  Connections: connectionStack,
  Notifications: notificationStack,
}, {
  tabBarComponent: TabBarComponent,
});

export const AppNavigator = createAppContainer(TabNavigator);
