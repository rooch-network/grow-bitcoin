// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { useState, type ReactNode } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RoochProvider, WalletProvider } from '@roochnetwork/rooch-sdk-kit'
import { networkConfig } from './networks'
import { isMainNetwork } from '@/utils/env'
import { Toaster } from 'react-hot-toast'

export default function RoochDappProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const network = isMainNetwork() ? 'mainnet' : 'testnet'
  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider
        networks={networkConfig}
        sessionConf={{
          appName: 'Rooch GROW',
          appUrl: 'https://test-grow.rooch.network',
          scopes: [`0x701c21bf1c8cd5af8c42983890d8ca55e7a820171b8e744c13f2d9998bf76cc3::*::*`],
          maxInactiveInterval: 86400, // 1 day
        }}
        defaultNetwork={network}
      >
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
