import {InitConfig} from '@gnarula/aries-framework-javascript/build/lib/types';
import RNFS from 'react-native-fs';

// ### Insert mediator URL here ###
export const mediatorURL = 'https://mediator.twins-project.org';
// ### Insert your Byzcoin ID here ###
export const bcID =
  '9832e2e66e1441b0f0da5011d50882cc49783b64af5371c6ac60b938f8a4e60c';

// ### Insert write instance ID here ###
//export const writeInstanceID = '31f999b3694a3afec57e1e376474c603f5c95609f825971924fde3cba8395223'
// export const writeInstanceID =
//   '5512c7c2413f568629010bbe8e09bda4f4f03d85f4c2ff33e46d67882d5f0136';

export const getWriteInstanceID = (did: string) => {
  if (did.includes('Baqh3nz5QX3zVQ6RWTmQGr')) {
    return '40108da1bc7f559c10bd0863c5c47c903b5fa4c02c3522982e247025e72383d9';
  } else if (did.includes('Up7iVfT6ihibgfrnzLJ74Q')) {
    return 'c241d7caba1e6945ca8d617f5cb55624d18b5c023546d001cc6a23e0b58b42c1';
  }
  throw new Error('did not supported for the demo');
}

// ### Insert document darc ID here ###
// export const documentDarc = 'dc852e8fdaf61b811211f4abf0686aa54ebbe60845fd98774899e69ff7ef6d19'
// export const documentDarc =
//   '4401770705c2140bb4d0e364f86b586bebc16c1faf768841794f43d420d781b2';

export const getDocumentDarc = (did: string) => {
  if (did.includes('Baqh3nz5QX3zVQ6RWTmQGr')) {
    return '535dd07a64da43326de88350faf7be38475c50a85c4bfd5228c734a3c6eeeb3a';
  } else if (did.includes('Up7iVfT6ihibgfrnzLJ74Q')) {
    return '50012bc89cd7f087a9b1e7be9e03eecc5c9e44df6c08fd861a0fe19431425d1f';
  }
  throw new Error('did not supported for the demo');
}

export const genesis_txn =
  '{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node1","blskey":"4N8aUNHSgjQVgkpm8nhNEfDf6txHznoYREg9kirmJrkivgL4oSEimFF6nsQ6M41QvhM2Z33nves5vfSn9n1UwNFJBYtWVnHYMATn76vLuL3zU88KyeAYcHfsih3He6UHcXDxcaecHVz6jhCYz1P2UZn2bDVruL5wXpehgBfBaLKm3Ba","blskey_pop":"RahHYiCvoNCtPTrVtP7nMC5eTYrsUA8WjXbdhNc8debh1agE9bGiJxWBXYNFbnJXoXhWFMvyqhqhRoq737YQemH5ik9oL7R4NTTCz2LEZhkgLJzB3QRQqJyBNyv7acbdHrAT8nQ9UkLbaVL9NBpnWXBTw4LEMePaSHEw66RzPNdAX1","client_ip":"159.203.21.90","client_port":9702,"node_ip":"159.203.21.90","node_port":9701,"services":["VALIDATOR"]},"dest":"Gw6pDLhcBcoQesN72qfotTgFa7cbuqZpkX3Xo6pLhPhv"},"metadata":{"from":"Th7MpTaRZVRYnPiabds81Y"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fea82e10e894419fe2bea7d96296a6d46f50f93f9eeda954ec461b2ed2950b62"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node2","blskey":"37rAPpXVoxzKhz7d9gkUe52XuXryuLXoM6P6LbWDB7LSbG62Lsb33sfG7zqS8TK1MXwuCHj1FKNzVpsnafmqLG1vXN88rt38mNFs9TENzm4QHdBzsvCuoBnPH7rpYYDo9DZNJePaDvRvqJKByCabubJz3XXKbEeshzpz4Ma5QYpJqjk","blskey_pop":"Qr658mWZ2YC8JXGXwMDQTzuZCWF7NK9EwxphGmcBvCh6ybUuLxbG65nsX4JvD4SPNtkJ2w9ug1yLTj6fgmuDg41TgECXjLCij3RMsV8CwewBVgVN67wsA45DFWvqvLtu4rjNnE9JbdFTc1Z4WCPA3Xan44K1HoHAq9EVeaRYs8zoF5","client_ip":"159.203.21.90","client_port":9704,"node_ip":"159.203.21.90","node_port":9703,"services":["VALIDATOR"]},"dest":"8ECVSk179mjsjKRLWiQtssMLgp6EPhWXtaYyStWPSGAb"},"metadata":{"from":"EbP4aYNeTHL6q385GuVpRV"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"1ac8aece2a18ced660fef8694b61aac3af08ba875ce3026a160acbc3a3af35fc"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node3","blskey":"3WFpdbg7C5cnLYZwFZevJqhubkFALBfCBBok15GdrKMUhUjGsk3jV6QKj6MZgEubF7oqCafxNdkm7eswgA4sdKTRc82tLGzZBd6vNqU8dupzup6uYUf32KTHTPQbuUM8Yk4QFXjEf2Usu2TJcNkdgpyeUSX42u5LqdDDpNSWUK5deC5","blskey_pop":"QwDeb2CkNSx6r8QC8vGQK3GRv7Yndn84TGNijX8YXHPiagXajyfTjoR87rXUu4G4QLk2cF8NNyqWiYMus1623dELWwx57rLCFqGh7N4ZRbGDRP4fnVcaKg1BcUxQ866Ven4gw8y4N56S5HzxXNBZtLYmhGHvDtk6PFkFwCvxYrNYjh","client_ip":"159.203.21.90","client_port":9706,"node_ip":"159.203.21.90","node_port":9705,"services":["VALIDATOR"]},"dest":"DKVxG2fXXTU8yT5N7hGEbXB3dfdAnYv1JczDUHpmDxya"},"metadata":{"from":"4cU41vWW82ArfxJxHkzXPG"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"7e9f355dffa78ed24668f0e0e369fd8c224076571c51e2ea8be5f26479edebe4"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"Node4","blskey":"2zN3bHM1m4rLz54MJHYSwvqzPchYp8jkHswveCLAEJVcX6Mm1wHQD1SkPYMzUDTZvWvhuE6VNAkK3KxVeEmsanSmvjVkReDeBEMxeDaayjcZjFGPydyey1qxBHmTvAnBKoPydvuTAqx5f7YNNRAdeLmUi99gERUU7TD8KfAa6MpQ9bw","blskey_pop":"RPLagxaR5xdimFzwmzYnz4ZhWtYQEj8iR5ZU53T2gitPCyCHQneUn2Huc4oeLd2B2HzkGnjAff4hWTJT6C7qHYB1Mv2wU5iHHGFWkhnTX9WsEAbunJCV2qcaXScKj4tTfvdDKfLiVuU2av6hbsMztirRze7LvYBkRHV3tGwyCptsrP","client_ip":"159.203.21.90","client_port":9708,"node_ip":"159.203.21.90","node_port":9707,"services":["VALIDATOR"]},"dest":"4PS3EDQ3dW1tci1Bp6543CfuuebjFrg36kLAUcskGfaA"},"metadata":{"from":"TWwCRQRZ2ZHMJFn9TzLp7W"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"aa5e817d7cc626170eca175822029339a444eb0ee8f0bd20d3b0b76e566fb008"},"ver":"1"}';
// export const filename =
//   'ed25519:76162f7de8c78e456b2593b2947bc442e5dfba4f14b9a3fb899c27bef6114720_2020_09_16_103606_DownloadTest.txt.aes';

export const getFilename = (did: string) => {
  if (did.includes('Baqh3nz5QX3zVQ6RWTmQGr')) {
    return 'ed25519:76162f7de8c78e456b2593b2947bc442e5dfba4f14b9a3fb899c27bef6114720_2021_04_23_093149_Cohort+2.pdf.aes';
  } else if (did.includes('Up7iVfT6ihibgfrnzLJ74Q')) {
    return 'ed25519:76162f7de8c78e456b2593b2947bc442e5dfba4f14b9a3fb899c27bef6114720_2021_04_23_093114_Cohort+1.pdf.aes';
  }
  throw new Error('did not supported for the demo');
}

export const walletPath = RNFS.DocumentDirectoryPath + '/indy_wallet';

export const agentConfig: InitConfig = {
  label: 'EdgeAgent',
  agencyUrl: mediatorURL,
  url: mediatorURL,
  port: 80,
  walletConfig: {
    id: 'EdgeWallet',
    storage_config: {
      path: walletPath,
    },
  },
  walletCredentials: {
    key: '',
  },
};
