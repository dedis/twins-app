import React, { useEffect } from 'react';
import { Layout, TopNavigation, useStyleSheet, Button, StyleService, TopNavigationAction, Icon, Input, IconElement } from '@ui-kitten/components'
import { useSafeArea } from 'react-native-safe-area-context';
import { ImageStyle, Keyboard, Platform, Image } from 'react-native';
import { KeyboardAvoidingView } from './keyboard-avoiding-view.component';
import { Message } from './chat-message.component';
import { Chat } from './chat.component';
import { Connection, Agent } from 'aries-framework-javascript';
import { InboundMessage } from 'aries-framework-javascript/build/lib/types';
import { RealTimeInboundTransporter } from 'transporters';

const themedStyles = StyleService.create({
  container: {
    flex: 1,
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  messageInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 16,
    backgroundColor: 'background-basic-color-1',
  },
  attachButton: {
    borderRadius: 24,
    marginHorizontal: 8,
  },
  messageInput: {
    flex: 9,
    marginHorizontal: 8,
  },
  sendButton: {
    marginRight: 4,
    marginVertical: 12
  },
  iconButton: {
    width: 24,
    height: 24,
  },
});

const keyboardOffset = (height: number): number => Platform.select({
  android: 0,
  ios: height,
}) as number;

export default ({ navigation, screenProps }) => {

  const safeArea = useSafeArea();
  const styles = useStyleSheet(themedStyles);

  const [messages, setMessages] = React.useState<Message[]>([])
  const [message, setMessage] = React.useState<string>();

  const BackIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name='arrow-ios-back' />
  );

  const PaperPlaneIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name='paper-plane' />
  );

  const renderBackAction = (): React.ReactElement => {
    return <TopNavigationAction
      icon={BackIcon}
      onPress={() => navigation.goBack()}
    />
  };

  const ToggleIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name='alert-circle-outline' />
  )

  const toggleConnectionButton = (): React.ReactElement => {
    return <TopNavigationAction
      icon={ToggleIcon}
      onPress={toggleConnection}
      />
  }

  const toggleConnection = (): void => {
    const inboundTransport = agent.inboundTransporter as RealTimeInboundTransporter;
    inboundTransport.toggle();
  }

  const agent: Agent = screenProps.agent;
  const connection: Connection = navigation.getParam('connection');

  const onSendButtonPress = async (): Promise<void> => {
    setMessages([...messages, { text: message as string, date: (new Date()).toLocaleString('en-US'), reply: true }])
    await agent.sendMessageToConnection(connection, message as string);
    setMessage(undefined);
    Keyboard.dismiss();
  }

  useEffect(() => {
    console.log('subscribing to messages on this connection');
    connection.on('basicMessageReceived', (message: Message) => {
      // @ts-ignore
      const { content, sent_time } = message;
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: content,
          date: sent_time,
          reply: false,
        }
      ])
    });
  }, [])

  const sendButtonEnabled = (): boolean => {
    return !!message && message.length > 0;
  };

  return (
    <Layout
      style={[styles.container, { paddingTop: safeArea.top }]}
      level='2'
    >
      <TopNavigation
        alignment='center'
        title='Connection Name'
        leftControl={renderBackAction()}
        rightControls={toggleConnectionButton()}
      />
      <Chat
        style={styles.chat}
        contentContainerStyle={styles.chatContent}
        followEnd={true}
        data={messages}
      />
      <KeyboardAvoidingView
        style={styles.messageInputContainer}
        offset={keyboardOffset}>
        <Input
          style={styles.messageInput}
          placeholder='Message...'
          value={message}
          onChangeText={setMessage}
        />
        <Button
          appearance='ghost'
          style={[styles.iconButton, styles.sendButton]}
          icon={PaperPlaneIcon}
          disabled={!sendButtonEnabled()}
          onPress={onSendButtonPress}
        />
      </KeyboardAvoidingView>
    </Layout>
  );
}
