type BaseTx = {
  to: string
  gas?: bigint
  gasPrice?: bigint
  nonce?: number
  value?: bigint
  data: string
}

export { BaseTx }
