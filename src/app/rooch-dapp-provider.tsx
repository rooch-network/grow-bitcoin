// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { useState, type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RoochProvider, WalletProvider } from '@roochnetwork/rooch-sdk-kit'
import { networkConfig } from './networks'
import { isMainNetwork } from '@/utils/env'
import { Toaster } from 'react-hot-toast'

// const queryClient = new QueryClient();

export default function RoochDappProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const network = isMainNetwork() ? 'mainnet' : 'testnet'
  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider networks={networkConfig} defaultNetwork={network}>
        <WalletProvider chain="bitcoin" autoConnect>
          <>
            {children}
            <Toaster position={'bottom-left'} />
          </>
        </WalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  )
}
