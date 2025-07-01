import axios, { AxiosInstance } from 'axios';
import {
  JupiterExecuteOrderResponse,
  JupiterOrderRequest,
  JupiterQuoteOrderResponse,
} from '../../types';
import { apiResponse } from '../api.helpers';
import { NATIVE_SOL_MINT, WRAPPED_SOL_MINT } from '../solana.lib';

const api: AxiosInstance = axios.create({
  baseURL: 'https://lite-api.jup.ag/ultra/v1',
});

export const jupiterRequests = {
  getOrder: async (params: JupiterOrderRequest) => {
    try {
      console.log('Fetching Jupiter order quote', params);

      const res = await api.get<JupiterQuoteOrderResponse>('/order', {
        params: {
          inputMint:
            params.inputMint === NATIVE_SOL_MINT
              ? WRAPPED_SOL_MINT
              : params.inputMint,
          outputMint:
            params.outputMint === NATIVE_SOL_MINT
              ? WRAPPED_SOL_MINT
              : params.outputMint,
          amount: params.amount,
          taker: params.taker,
          // TODO
          // referralAccount: '5QDwYS1CtHzN1oJ2eij8Crka4D2eJcUavMcyuvwNRM9',
          // referralFee: 100,
        },
      });

      return apiResponse(true, 'Fetched Jupiter order quote', res.data);
    } catch (err: any) {
      console.log('Error fetching Jupiter order quote:', err?.response?.data);
      return apiResponse(false, 'Failed to get quote.', err);
    }
  },

  executeOrder: async (
    orderResponse: JupiterQuoteOrderResponse,
    signTransaction: (transaction: Buffer) => Promise<string>
  ) => {
    try {
      // Deserialize the transaction
      const transactionBuffer = Buffer.from(
        orderResponse.transaction,
        'base64'
      );

      // Request wallet to sign the transaction
      const signedTransaction = await signTransaction(transactionBuffer);

      const res = await api.post<JupiterExecuteOrderResponse>('/execute', {
        signedTransaction,
        requestId: orderResponse.requestId,
      });

      return apiResponse(true, 'Order executed successfully', res.data);
    } catch (err: any) {
      console.log('Error executing Jupiter order:', err?.response?.data);
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      );
    }
  },
};
