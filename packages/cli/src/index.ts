import chalk from 'chalk'
import {
  createShieldedWalletClient,
  getShieldedContract,
  seismicDevnet,
} from 'seismic-viem'
import { http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

import { CONTRACT_DIR, CONTRACT_NAME } from '../lib/constants'
import {
  displayTransaction,
  printFail,
  printSuccess,
  readAbi,
} from '../lib/utils'

/*
 * Send encrypted transaction to increment counter. Waits for confirmation.
 */
async function incrementCounter(
  step: number,
  explorerUrl: string,
  contract: any,
  walletClient: any,
  abi: any,
  amount: number
) {
  console.log(chalk.blue(`\n\nStep ${step}: Incrementing counter by ${amount}`))
  const { plaintextTx, shieldedTx, txHash } = await contract.dwrite.increment([
    amount,
  ])
  displayTransaction(plaintextTx, abi[2])
  displayTransaction(shieldedTx, undefined, true)
  await walletClient.waitForTransactionReceipt({
    hash: txHash,
  })
  printSuccess(
    `Transaction confirmed: ${chalk.green(`${explorerUrl}/tx/${txHash}`)}`
  )
}

/*
 * Attempt to read counter value. Only succeeds if counter is above the
 * threshold.
 */
async function readCounter(step: number, contract: any) {
  console.log(chalk.blue(`\n\nStep ${step}: Attempting to read counter`))
  let result;
  try {
    result = Number(await contract.read.getNumber([]))
  } catch (_) {
    result = '???'
  }
  printSuccess(`Value: ${chalk.green(result)}`)
}

async function main() {
  const [rpcUrl, explorerUrl, contractAddr, privkey] = process.argv.slice(2)

  const abi = await readAbi(CONTRACT_DIR, CONTRACT_NAME)
  const walletClient = await createShieldedWalletClient({
    chain: seismicDevnet,
    transport: http(rpcUrl),
    account: privateKeyToAccount(privkey as `0x${string}`),
  })
  const contract = getShieldedContract({
    abi: abi,
    address: contractAddr as `0x${string}`,
    client: walletClient,
  })

  await incrementCounter(4, explorerUrl, contract, walletClient, abi, 3)
  await readCounter(5, contract)
  await incrementCounter(6, explorerUrl, contract, walletClient, abi, 2)
  await readCounter(7, contract)

  console.log('\n')
  printSuccess('Success. You just interacted with your first Seismic contract!')
}

main()
