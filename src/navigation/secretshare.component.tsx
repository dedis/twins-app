import React, { useEffect } from 'react'
import { Button, Input, Layout, Modal, Select, SelectOption, SelectOptionType, StyleService, Text, useStyleSheet } from "@ui-kitten/components"
import { useState } from "react"
import { Alert, DocumentSelectionState, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import * as secrets from 'secrets.js-grempe';
import QRCode from 'react-native-qrcode-svg';

export const SecretShareScreen = ({ navigation, screenProps }) => {
  const maxTotalShares = 10;
  const [ maxThresholdShares, setMaxThresholdShares ] = useState(maxTotalShares);
  const [totalShares, setTotalShares] = useState<SelectOption>();
  const [thresholdShares, setThresholdShares] = useState<SelectOption>();

  const themedStyles = StyleService.create({
    safeArea: {
      backgroundColor: '$background-basic-color-1',
      flex: 1,
      color: '$text-basic-color',
    }
  })

  const styles = useStyleSheet(themedStyles);

  const totalSharesOptions = Array.from({ length: maxTotalShares }, (_, i) => i+1).map(x => ({text: `${x}` }));
  const thresholdSharesOptions = Array.from({ length: maxThresholdShares }, (_, i) => i+1).map(x => ({ text: `${x} `}));

  const key: string = navigation.getParam('key')

  const onShare = () => {
    const numTotalShares = Number.parseInt((totalShares as SelectOptionType).text);
    const numThresholdShares = Number.parseInt((thresholdShares as SelectOptionType).text);
    const shares = secrets.share(key, numTotalShares, numThresholdShares);
    navigation.navigate('ShareQRCode', {values: shares});
  }

  const ontotalSharesUpdate = (x: SelectOption) => {
    const option = (x as SelectOptionType)
    setTotalShares(x);
    setMaxThresholdShares(Number.parseInt(option.text));
    setThresholdShares({ text: ''});
  }

  const onThresholdSharesUpdate = (x: SelectOption) => {
    const option = (x as SelectOptionType)
    setThresholdShares(x);
  }

  const disableShare = () => {
    if (totalShares === undefined || thresholdShares === undefined) {
      return true;
    }
    return (totalShares as SelectOptionType).text === '' ||
      (thresholdShares as SelectOptionType).text === '' ||
      Number.parseInt((thresholdShares as SelectOptionType).text) < 2;
  }

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={{ flex: 1, justifyContent: 'center', margin: 10 }}>
        <Text style={{ flex: 2 }}>
          Secret sharing allows you to split the secret key protecting your
          wallet into multiple parts, which you may share with trusted people in
          the form of QR codes. You may reconstruct the secret key by combining
          M, a threshold, out of N total shares.
        </Text>
        <Layout style={{ flex: 1 }}>
          <Text>Number of shares you want to split your key into</Text>
          <Select data={totalSharesOptions} selectedOption={totalShares} onSelect={ontotalSharesUpdate} />
          <Text>Threshold number of shares</Text>
          <Select data={thresholdSharesOptions} selectedOption={thresholdShares} onSelect={onThresholdSharesUpdate}/>

          <Button onPress={onShare} disabled={disableShare()} >Share</Button>
        </Layout>
      </Layout>
    </SafeAreaView>
  )
}