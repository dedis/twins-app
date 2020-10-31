import {
  Button,
  Icon,
  IconElement,
  Layout,
  Select,
  SelectOption,
  SelectOptionType,
  StyleService,
  Text,
  TopNavigation,
  TopNavigationAction,
  useStyleSheet,
} from '@ui-kitten/components';
import React, {useState} from 'react';
import {ImageStyle, SafeAreaView} from 'react-native';

export const RecoverSecretScreen = ({navigation}) => {
  const maxTotalShares = 10;
  const thresholdSharesOptions = Array.from(
    {length: maxTotalShares},
    (_, i) => i + 1,
  ).map((x) => ({text: `${x} `}));
  const [thresholdShares, setThresholdShares] = useState<SelectOption>();

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

  const renderBackAction = (): React.ReactElement => {
    return (
      <TopNavigationAction
        icon={BackIcon}
        onPress={() => navigation.goBack()}
      />
    );
  };

  const BackIcon = (style: ImageStyle): IconElement => (
    <Icon {...style} name="arrow-ios-back" />
  );

  const styles = useStyleSheet(themedStyles);

  const onThresholdSharesUpdate = (x: SelectOption) => {
    setThresholdShares(x);
  };

  const onScanShares = () => {
    navigation.navigate('ScanShares', {
      totalShares: Number.parseInt(
        (thresholdShares as SelectOptionType).text,
        10,
      ),
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <Layout style={[styles.container]} level="1">
        <TopNavigation
          alignment="center"
          title="Recover Wallet Key"
          leftControl={renderBackAction()}
        />
        <Text>Please select the threshold number of shares</Text>
        <Select
          data={thresholdSharesOptions}
          selectedOption={thresholdShares}
          onSelect={onThresholdSharesUpdate}
        />
        <Button onPress={onScanShares}>Scan Shares</Button>
      </Layout>
    </SafeAreaView>
  );
};
