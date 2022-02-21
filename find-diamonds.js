const fs = require('fs');

const { BLOCK_NUM_HOLDING_UNTIL, BLOCK_NUM_HOLDING_START } = require('./constants')

const main = () => {
    let txns = JSON.parse(fs.readFileSync(`./txns/wgg-txns-by-${BLOCK_NUM_HOLDING_UNTIL}.json`))

    txns = txns.map(t => ({ ...t, blockNum: parseInt(t.blockNum, 16), tokenId: String(parseInt(t.tokenId, 16)) }))

    const last_owner = txns.reduce((acc, cur) => {
        if (cur.blockNum <= BLOCK_NUM_HOLDING_START) {
            if (acc[cur.tokenId]) {
                if (acc[cur.tokenId].blockNum < cur.blockNum) {
                    acc[cur.tokenId] = {
                        owner: cur.to,
                        blockNum: cur.blockNum
                    }
                } else if (acc[cur.tokenId].blockNum === cur.blockNum) {
                    throw new Error('Nerd this is wrong')
                }
            } else {
                acc[cur.tokenId] = {
                    owner: cur.to,
                    blockNum: cur.blockNum
                }
            }
        }
        return acc;

    }, {})

    const token_transferred = txns.reduce((acc, cur) => {
        if (BLOCK_NUM_HOLDING_START < cur.blockNum && cur.blockNum <= BLOCK_NUM_HOLDING_UNTIL) {
            acc.add(cur.tokenId)
            return acc;
        }
        return acc;
    }, new Set())

    const resultList = Object.entries(last_owner).filter(([x]) => !token_transferred.has(x))

    console.log('💎token count: ' + resultList.length)

    const ownerMap = resultList.reduce((acc, cur) => {
        if (acc[cur[1].owner]) {
            acc[cur[1].owner].push({
                tokenId: cur[0],
                lastBlockNum: cur[1].blockNum
            })
        } else {
            acc[cur[1].owner] = [{
                tokenId: cur[0],
                lastBlockNum: cur[1].blockNum
            }]
        }
        return acc
    }, {})

    console.log('💎owner address count: ' + Object.entries(ownerMap).length)

    fs.writeFileSync(
        `./results/result_owner-${BLOCK_NUM_HOLDING_UNTIL}.csv`,
        'owner; tokens\n' + Object.entries(ownerMap).map(([owner, tokenList]) => `${owner};"${JSON.stringify(tokenList)}"\n`).join(''),
        { flag: 'w+' }
    )
    console.log('Result file save to ' + `./results/result_owner-${BLOCK_NUM_HOLDING_UNTIL}.csv`)
}

main()