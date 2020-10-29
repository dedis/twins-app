import React from 'react';
import {SafeAreaView} from 'react-navigation';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
  Divider,
  Layout,
} from '@ui-kitten/components';
import {StyleSheet} from 'react-native';

export const TabBarComponent = ({navigation}) => {
  const onSelect = (index: number) => {
    const selectedTabRoute = navigation.state.routes[index];
    navigation.navigate(selectedTabRoute.routeName);
  };

  const HomeIcon = style => <Icon {...style} name="home-outline" />;

  const ConnectionsIcon = style => <Icon {...style} name="link-outline" />;

  const NotificationsIcon = style => <Icon {...style} name="bell-outline" />;

  const titleStyle = {textTransform: 'uppercase'};

  return (
    <Layout style={{paddingBottom: 6}}>
      <Divider />
      <BottomNavigation
        selectedIndex={navigation.state.index}
        onSelect={onSelect}>
        <BottomNavigationTab
          title="Home"
          icon={HomeIcon}
          titleStyle={titleStyle}
        />
        <BottomNavigationTab
          title="Connections"
          icon={ConnectionsIcon}
          titleStyle={titleStyle}
        />
        <BottomNavigationTab
          title="Requests"
          icon={NotificationsIcon}
          titleStyle={titleStyle}
        />
      </BottomNavigation>
    </Layout>
  );
};
