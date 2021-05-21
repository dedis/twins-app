import React from 'react';
import {LayoutList} from '../../components/layout-list.component';
import {useSelector} from 'react-redux';
import {RootState} from 'src/app/rootReducer';
import {StyleService, useStyleSheet} from '@ui-kitten/components';
import {SafeAreaView} from 'react-navigation';

export const ConnectionsScreen = () => {
  const connections = useSelector((state: RootState) => state.connections);
  const themedStyles = StyleService.create({
    safeArea: {
      backgroundColor: '$background-basic-color-2',
      flex: 1,
      color: '$text-basic-color',
    },
  });

  const styles = useStyleSheet(themedStyles);

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <LayoutList data={connections.items} onItemPress={() => {}} />
    </SafeAreaView>
  );
};
