import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  JupiterExecuteOrderResponse,
  JupiterOrderRequest,
  JupiterQuoteOrderResponse,
} from '../../types';
import { apiResponse } from '../api.helpers';

const api: AxiosInstance = axios.create({
  baseURL: 'https://lite-api.jup.ag/ultra/v1',
});

export const jupiterRequests = {
  getOrder: async (params: JupiterOrderRequest) => {
    try {
      const res = await api.get<JupiterQuoteOrderResponse>('/order', {
        params: {
          inputMint: params.inputMint,
          outputMint: params.outputMint,
          amount: params.amount,
          taker: params.taker,
          referralAccount: params.referralAccount,
          referralFee: params.referralFee,
        },
      });

      return apiResponse(true, 'Fetched Jupiter order quote', res.data);
    } catch (err: any) {
      console.log('Error fetching Jupiter order quote:', err?.response?.data);
      if (err instanceof AxiosError) {
        console.log('WEEEE', err?.response);
      }
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      );
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
