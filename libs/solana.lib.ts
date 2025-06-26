import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'

export const NATIVE_SOL_MINT = 'So11111111111111111111111111111111111111111'
export const WRAPPED_SOL_MINT = 'So11111111111111111111111111111111111111112'

export const sendNativeSol = async (
  connection: Connection,
  {
    amount,
    fromPubkey,
    toPubkey,
  }: {
    amount: number
    fromPubkey: PublicKey
    toPubkey: PublicKey
  }
) => {
  try {
    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0 // note: simple accounts that just store native SOL have `0` bytes of data
    )

    if (amount < minimumBalance) {
      throw new Error(`account may not be rent exempt: ${toPubkey.toBase58()}`)
      // return Response.json({
      //   error: `account may not be rent exempt: ${toPubkey.toBase58()}`,
      // })
    }

    // create an instruction to transfer native SOL from one wallet to another
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: fromPubkey,
      toPubkey: toPubkey,
      lamports: amount,
    })

    // get the latest blockhash amd block height
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash()

    // create a legacy transaction
    const transaction = new Transaction({
      feePayer: fromPubkey,
      blockhash,
      lastValidBlockHeight,
    }).add(transferSolInstruction)

    // const transaction = new Transaction().add(
    //   SystemProgram.transfer({
    //     fromPubkey: fromPubkey,
    //     toPubkey: toPubkey,
    //     lamports: amount,
    //   })
    // )
    // transaction.feePayer = fromPubkey
    // transaction.recentBlockhash = (
    //   await connection.getLatestBlockhash()
    // ).blockhash
    // transaction.lastValidBlockHeight = (
    //   await connection.getLatestBlockhash()
    // ).lastValidBlockHeight

    return transaction
  } catch (error: any) {
    throw new Error(error.message || 'Unknown error occurred')
  }
}

export const calculateFee = async (
  connection: Connection,
  transaction: Transaction
) => {
  const fee = await connection.getFeeForMessage(
    transaction.compileMessage(),
    'confirmed'
  )
  return fee.value || 0
}
