import { ENV } from '@/constants/Env'
import axios, { AxiosInstance } from 'axios'
import { apiResponse } from '../api.helpers'

const api: AxiosInstance = axios.create({
  baseURL: 'https://api.rugcheck.xyz/v1',
  headers: {
    accept: 'application/json',
    'x-chain': 'solana',
    'X-API-KEY': ENV.BIRDEYE_API_KEY,
  },
})

export const birdeyeRequests = {
  getTokenReport: async (mint_address: string) => {
    try {
      const res = await api.get(`/tokens/${mint_address}/report`)

      return apiResponse(true, 'Fetched rugged data', res.data)
    } catch (err: any) {
      console.log('Error fetching token report:', err?.response?.data)
      return apiResponse(
        false,
        err?.response?.data?.message || err?.message || 'Error occurred.',
        err
      )
    }
  },
}
