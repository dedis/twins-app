import {
  Button,
  Icon,
  IconElement,
  Layout,
  StyleService,
  TopNavigation,
  TopNavigationAction,
  useStyleSheet,
} from '@ui-kitten/components';
import React, {RefObject, useEffect, useRef, useState} from 'react';
import {ImageStyle, SafeAreaView, View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import * as Keychain from 'react-native-keychain';
import {walletPath} from 'src/app/config';
import * as secrets from 'secrets.js-grempe';

export const ScanSharesScreen = ({navigation}) => {
  const [currentShare, setCurrentShare] = useState(0);
  const totalShares = navigation.getParam('totalShares');
  const [shareValues, setShareValues] = useState<secrets.Shares>([]);
  const [showButton, setShowButton] = useState(false);

  const scanner = useRef<QRCodeScanner>(null);

  const themedStyles = StyleService.create({
    container: {
      flex: 1,
    },
    safeArea: {
      backgroundColor: '$background-basic-color-1',
      flex: 1,
      color: '$text-basic-color',
    },
  });

  const styles = useStyleSheet(themedStyles);

  const renderBackAction = (): React.ReactElement => {
    return (
      <TopNavigationAction
        icon={BackIcon}
        onPress={() => navigation.goBack()}
      />;
    );
  };

  const BackIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name="arrow-ios-back" />
  );

  useEffect(() => {
    const setKey = async () => {
      if (currentShare === totalShares) {
        const key = secrets.combine(shareValues);
        await Keychain.setGenericPassword(walletPath, key, {
          accessControl:
            Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          authenticationType:
            Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
          accessible: Keychain.ACCESSIBLE.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
          securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
        });
        navigation.popToTop();
      }
    };

    setKey();
  }, [currentShare]);

  const onRead = (e: any) => {
    setShareValues([...shareValues, e.data]);
    setCurrentShare(val => val + 1);
    setShowButton(true);
  };

  const onScanNextShare = () => {
    if (scanner.current !== null) {
      scanner.current!.reactivate();
      setShowButton(false);
    } else {
      console.log('scanner.current is null');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={[styles.container]} level="1">
        <TopNavigation
          alignment="center"
          title={`Scan Share ${currentShare + 1} of ${totalShares}`}
          leftControl={renderBackAction()}
        />
        <View style={{display: showButton ? 'none' : 'flex'}}>
          <QRCodeScanner ref={scanner} onRead={onRead} />
        </View>
        {showButton && (
          <Button onPress={onScanNextShare}>Scan Next Share</Button>
        )}
      </Layout>
    </SafeAreaView>
  );
};
