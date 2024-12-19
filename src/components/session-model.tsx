// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0

import React, { useState } from 'react'
import { Modal, Button, Stack } from '@mantine/core'
import {
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentNetwork,
} from '@roochnetwork/rooch-sdk-kit'
import { useNetworkVariable } from '../app/networks'
interface CreateSessionModalProps {
  isOpen: boolean
  onClose: () => void
}
export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({ isOpen, onClose }) => {
  const { mutateAsync: createSessionKey } = useCreateSessionKey()
  const contractAddr = useNetworkVariable('contractAddr')
  const network = useCurrentNetwork()
  const [error, setError] = useState(0)
  const addr = useCurrentAddress()

  const handleCreateSession = async () => {
    if (error !== 0) {
      const tag = network === 'mainnet' ? '' : 'test-'
      window.open(`https://${tag}portal.rooch.network/faucet/${addr?.toStr()}`)
      setError(0)
      return
    }

    try {
      await createSessionKey({
        appName: 'Rooch GROW',
        appUrl: 'https://test-grow.rooch.network',
        scopes: [`${contractAddr}::*::*`],
        maxInactiveInterval: 86400, // 1 day
      })
      onClose()
    } catch (e: any) {
      if (e.code === 1004) {
        setError(e.code)
      }
      console.log(e.code)
    }
  }

  return (
    <Modal opened={isOpen} onClose={onClose} title="Session Required">
      <text>{error !== 0 ? 'RGas not sufficient funds' : 'Create a stake session'}</text>
      <Stack mt="md">
        <Button onClick={handleCreateSession}>{error !== 0 ? 'Click To Faucet' : 'Create'}</Button>
      </Stack>
    </Modal>
  )
}
