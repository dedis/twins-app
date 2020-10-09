import React, { useEffect } from 'react'
import { Button, Input, Layout, Modal, Select, SelectOption, SelectOptionType, Text } from "@ui-kitten/components"
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

  const totalSharesOptions = Array.from({ length: maxTotalShares }, (_, i) => i+1).map(x => ({text: `${x}` }));
  const thresholdSharesOptions = Array.from({ length: maxThresholdShares }, (_, i) => i+1).map(x => ({ text: `${x} `}));

  const key: string = navigation.getParam('key')

  const onShare = () => {
    const numTotalShares = Number.parseInt((totalShares as SelectOptionType).text);
    const numThresholdShares = Number.parseInt((thresholdShares as SelectOptionType).text);
    const shares = secrets.share(secrets.str2hex(key), numTotalShares, numThresholdShares);
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
    <SafeAreaView style={{ flex: 1 }}>
      <Layout style={{ flex: 1, justifyContent: 'center' }}>
        <Text>Number of shares you want to split your key into</Text>
        <Select data={totalSharesOptions} selectedOption={totalShares} onSelect={ontotalSharesUpdate} />
        <Text>Threshold number of shares</Text>
        <Select data={thresholdSharesOptions} selectedOption={thresholdShares} onSelect={onThresholdSharesUpdate}/>

        <Button onPress={onShare} disabled={disableShare()} >Share</Button>
      </Layout>
    </SafeAreaView>
  )
}