import React from 'react';
import { LayoutListElement, LayoutList } from '../../components/layout-list.component';
import { LayoutItem } from 'src/model/layout-item.model';
import { useSelector } from 'react-redux';
import { RootState } from 'src/app/rootReducer';

export const ConnectionsScreen = ({ navigation, screenProps }): LayoutListElement => {
  const connections = useSelector((state: RootState) => state.connections)

  return (
    <LayoutList
      data={connections.items}
      onItemPress={() => {}}
      />
  );
};