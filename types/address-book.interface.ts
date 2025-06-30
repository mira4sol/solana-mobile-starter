export interface AddressBookEntry {
  id: string;
  name: string;
  walletAddress: string;
  description?: string;
  network?: string; // e.g., "solana", "soon", etc.
  tags: string[];
  isFavorite?: boolean;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface AddressBookResponse {
  entries: AddressBookEntry[];
  total: number;
}
