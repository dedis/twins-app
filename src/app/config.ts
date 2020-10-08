import { InitConfig } from 'aries-framework-javascript/build/lib/types';
import RNFS from 'react-native-fs'

// ### Insert mediator URL here ###
export const mediatorURL = 'https://mediator.twins-project.org';
// ### Insert your Byzcoin ID here ###
export const bcID =
  '9832e2e66e1441b0f0da5011d50882cc49783b64af5371c6ac60b938f8a4e60c';

// ### Insert write instance ID here ###
//export const writeInstanceID = '31f999b3694a3afec57e1e376474c603f5c95609f825971924fde3cba8395223'
export const writeInstanceID = '5512c7c2413f568629010bbe8e09bda4f4f03d85f4c2ff33e46d67882d5f0136'

// ### Insert document darc ID here ###
// export const documentDarc = 'dc852e8fdaf61b811211f4abf0686aa54ebbe60845fd98774899e69ff7ef6d19'
export const documentDarc = '4401770705c2140bb4d0e364f86b586bebc16c1faf768841794f43d420d781b2'

export const genesis_txn = '{"reqSignature":{},"txn":{"data":{"data":{"alias":"FoundationBuilder","blskey":"3gmhmqpPLqznZF3g3niodaHjbpsB6TEeE9SpgXgBnZJLmXgeRzJqTLajVwbhxrkomJFTFU4ohDC4ZRXKbUPCQywJuPAQnst8XBtCFredMECn4Z3goi1mNt5QVRdU8Ue2xMSkdLpsQMjCsNwYUsBguwXYUQnDXQXnHqRkK9qrivucQ5Z","blskey_pop":"RHWacPhUNc9JWsGNdmWYHrAvvhsow399x3ttNKKLDpz9GkxxnTKxtiZqarkx4uP5ByTwF4kM8nZddFKWuzoKizVLttALQ2Sc2BNJfRzzUZMNeQSnESkKZ7U5vE2NhUDff6pjANczrrDAXd12AjSG61QADWdg8CVciZFYtEGmKepwzP","client_ip":"35.161.146.16","client_port":"9702","node_ip":"50.112.53.5","node_port":"9701","services":["VALIDATOR"]},"dest":"GVvdyd7Y6hsBEy5yDDHjqkXgH8zW34K74RsxUiUCZDCE"},"metadata":{"from":"V5qJo72nMeF7x3ci8Zv2WP"},"type":"0"},"txnMetadata":{"seqNo":1,"txnId":"fe991cd590fff10f596bb6fe2362229de47d49dd50748e38b96f368152be29c7"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"vnode1","blskey":"t5jtREu8au2dwFwtH6QWopmTGxu6qmJ3iSnk321yLgeu7mHQRXf2ZCBuez8KCAQvFZGqqAoy2FcYvDGCqQxRCz9qXKgiBtykzxjDjYu87JECwwddnktz5UabPfZmfu6EoDn4rFxvd4myPu2hksb5Z9GT6UeoEYi7Ub3yLFQ3xxaQXc","blskey_pop":"QuHB7tiuFBPQ6zPkwHfMtjzWqXJBLACtfggm7zCRHHgdva18VN4tNg7LUU2FfKGQSLZz1M7oRxhhgJkZLL19aGvaHB2MPtnBWK9Hr8LMiwi95UjX3TVXJri4EvPjQ6UUvHrjZGUFvKQphPyVTMZBJwfkpGAGhpbTQuQpEH7f56m1X5","client_ip":"206.189.143.34","client_port":"9796","node_ip":"206.189.143.34","node_port":"9797","services":["VALIDATOR"]},"dest":"9Aj2LjQ2fwszJRSdZqg53q5e6ayScmtpeZyPGgKDswT8"},"metadata":{"from":"FzAaV9Waa1DccDa72qwg13"},"type":"0"},"txnMetadata":{"seqNo":2,"txnId":"5afc282bf9a7a5e3674c09ee48e54d73d129aa86aa226691b042e56ff9eaf59b"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"xsvalidatorec2irl","blskey":"4ge1yEvjdcV6sDSqbevqPRWq72SgkZqLqfavBXC4LxnYh4QHFpHkrwzMNjpVefvhn1cgejHayXTfTE2Fhpu1grZreUajV36T6sT4BiewAisdEw59mjMxkp9teYDYLQqwPUFPgaGKDbFCUBEaNdAP4E8Q4UFiF13Qo5842pAY13mKC23","blskey_pop":"R5PoEfWvni5BKvy7EbUbwFMQrsgcuzuU1ksxfvySH6FC5jpmisvcHMdVNik6LMvAeSdt6K4sTLrqnaaQCf5aCHkeTcQRgDVR7oFYgyZCkF953m4kSwUM9QHzqWZP89C6GkBx6VPuL1RgPahuBHDJHHiK73xLaEJzzFZtZZxwoWYABH","client_ip":"52.50.114.133","client_port":"9702","node_ip":"52.209.6.196","node_port":"9701","services":["VALIDATOR"]},"dest":"DXn8PUYKZZkq8gC7CZ2PqwECzUs2bpxYiA5TWgoYARa7"},"metadata":{"from":"QuCBjYx4CbGCiMcoqQg1y"},"type":"0"},"txnMetadata":{"seqNo":3,"txnId":"1972fce7af84b7f63b7f0c00495a84425cce3b0c552008576e7996524cca04cb"},"ver":"1"}\n{"reqSignature":{},"txn":{"data":{"data":{"alias":"danube","blskey":"3Vt8fxn7xg8n8pR872cvGWNuR7STFzFSPMftX96zF6871wYVTR27aspxGSeEtx9wj8g4D3GdCxHJbQ4FsxQz6TATQswiiZfxAVNjLLUci8WSH4t1GPx9CvGXB2uzDfVnnJyhhnASxJEbvykLUBBFG3fW4tMQixujpowUADz5jHm427u","blskey_pop":"RJpXXLkjRRv9Lk8tJz8LTkhhC7RWjHQcB9CG8J8U8fXT6arTDMYc62zXtToBAmGkGu8Udsmo3Hh7mv4KB9JAf8ufGY9WsnppCVwar7zEXyBfLpCnDhvVcBAzkhRpHmqHygN24DeBu9aH6tw4uXxVJvRRGSbPtxjWa379BmfQWzXHCb","client_ip":"207.180.207.73","client_port":"9702","node_ip":"173.249.14.196","node_port":"9701","services":["VALIDATOR"]},"dest":"52muwfE7EjTGDKxiQCYWr58D8BcrgyKVjhHgRQdaLiMw"},"metadata":{"from":"VbPQNHsvoLZdaNU7fTBeFx"},"type":"0"},"txnMetadata":{"seqNo":4,"txnId":"ebf340b317c044d970fcd0ca018d8903726fa70c8d8854752cd65e29d443686c"},"ver":"1"}';

export const filename = 'ed25519:76162f7de8c78e456b2593b2947bc442e5dfba4f14b9a3fb899c27bef6114720_2020_09_16_103606_DownloadTest.txt.aes'

export const walletPath = RNFS.DocumentDirectoryPath + '/indy_wallet'

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
    key: ''
  },
  publicDid: 'Baqh3nz5QX3zVQ6RWTmQGr',
  publicDidSeed: 'fm*njofkMT(vuj>qd4cyCDYjzeCkzUne',
};