const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const fs = require('fs');
const { BLOCK_NUM_WGG_CONTRACT_DEPLOY, BLOCK_NUM_HOLDING_UNTIL, WGG_CONTRACT_ADDRESS } = require("./constants");
const { int2Hex } = require("./utils");

const ALCHEMY_API_END_POINT = ""

const web3 = createAlchemyWeb3(ALCHEMY_API_END_POINT);

const main = async () => {
  let txns = []
  let pageKey = undefined
  console.log('Start Downloading Txns...')
  while (true) {
    const resp = await web3.alchemy.getAssetTransfers({
      category: ["erc721"],
      fromBlock: int2Hex(BLOCK_NUM_WGG_CONTRACT_DEPLOY),
      toBlock: int2Hex(BLOCK_NUM_HOLDING_UNTIL),
      contractAddresses: [WGG_CONTRACT_ADDRESS],
      pageKey
    })
    txns.push(...resp.transfers)
    console.log(txns.length + " txns downloaded...")
    if (resp.pageKey) {
      pageKey = resp.pageKey
    } else {
      break
    }
  }
  fs.writeFileSync(`./txns/wgg-txns-by-${BLOCK_NUM_HOLDING_UNTIL}.json`, JSON.stringify(txns), { flags: 'w+' })
  console.log(`Total ${txns.length} txns downloaded, saved to ./txns/wgg-txns-by-${BLOCK_NUM_HOLDING_UNTIL}.json`)
}
main()
