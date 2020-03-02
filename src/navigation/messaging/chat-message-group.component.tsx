import * as React from 'react';
import { View, ViewProps } from 'react-native';
import { StyleType } from '@ui-kitten/components';
import { ChatMessageElement, Message } from './chat-message.component';

export interface ChatMessageGroupProps extends ViewProps {
  data: Message[];
  renderItem: (message: Message, style: StyleType) => React.ReactElement;
}

export const ChatMessageGroup = (props: ChatMessageGroupProps): React.ReactElement => {

  const { data, renderItem, ...viewProps } = props;

  const renderMessage = (item: Message, key: number): ChatMessageElement => {
    // @ts-ignore
    return React.cloneElement(renderItem(item), { key });
  };

  return (
    <View
      {...viewProps}>
      {data.map(renderMessage)}
    </View>
  );
};