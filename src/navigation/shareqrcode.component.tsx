import { current } from '@reduxjs/toolkit';
import { Layout, Text } from '@ui-kitten/components';
import React, { useEffect, useState } from 'react';
import { Share } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-navigation';

export const ShareQRCodeScreen = ({ navigation }) => {
  let svg: any

  const values = navigation.getParam('values');
  const [value, setValue] = useState(values[0]);
  const [idx, setIdx] = useState(0);

  const generateDataURL = () => {
    return new Promise<string>(resolve => {
      svg.toDataURL((data: string) => {
        resolve(data);
      });
    });
  }

  useEffect(() => {
    if (svg !== undefined) {
      const showShareMenu = async () => {
        const data = await generateDataURL();
        await Share.share({
          title: `Share ${idx+1} of ${values.length}`,
          url: `data:image/png;base64,${data}`,
        });
        if (idx < values.length-1) {
          setIdx(idx+1);
          setValue(values[idx+1]);
        } else {
          navigation.popToTop();
        }
      }

      showShareMenu();
    }
  }, [value]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Secret share {idx+1} of {values.length}</Text>
        <QRCode size={200} value={value} backgroundColor='white' getRef={c => (svg = c)}></QRCode>
      </Layout>
    </SafeAreaView>
  )
}