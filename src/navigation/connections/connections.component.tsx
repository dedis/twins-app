import React from 'react';
import { LayoutListElement, LayoutList } from '../../components/layout-list.component';
import { LayoutItem } from 'src/model/layout-item.model';
import { Connection } from 'aries-framework-javascript';
import { useSelector } from 'react-redux';
import { RootState } from 'src/app/rootReducer';

export interface Connections extends LayoutItem {
  route: string;
  connection: Connection,
  did: string,
}

export const ConnectionsScreen = ({ navigation, screenProps }): LayoutListElement => {
  const connections = useSelector((state: RootState) => state.connections)

  return (
    <LayoutList
      data={connections.items}
      onItemPress={() => {}}
      />
  );
};