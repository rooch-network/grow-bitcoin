// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useState } from 'react'
import { Card, Select, Button, Text, Flex } from '@mantine/core'
import {
  useCurrentSession,
  useRoochClient,
  UseSignAndExecuteTransaction,
} from '@roochnetwork/rooch-sdk-kit'
import { shortAddress } from '@/utils/address'
import { useNetworkVariable } from '@/app/networks'
import { Args, Transaction } from '@roochnetwork/rooch-sdk'
import { CreateSessionModal } from './session-model'
import { formatBalance } from '@/utils/balance'
import toast from 'react-hot-toast'
const moduleName = 'grow_bitcoin'
export type AssetsType = {
  id: string
  value: string
}
interface StakeCardProps {
  target: 'bbn' | 'self'
  assets: AssetsType[]
}

type StakeInfo = {
  staked: boolean
  harvest: number
}

type Action = 'stake' | 'unStake' | 'claim' | 'Not Found'
export const StakeCard: React.FC<StakeCardProps> = ({ target, assets }) => {
  const session = useCurrentSession()
  const [showSessionModel, setShowSessionModel] = useState(false)
  const contractAddr = useNetworkVariable('contractAddr')
  const [selectValue, setSelectValue] = useState<string>()
  const [selectUTXO, setSelectUTXO] = useState<string>()
  const [stakeInfo, setStakeInfo] = useState<StakeInfo>()
  const [action, setAction] = useState<Action>('stake')
  const [actionLoading, setActionLoading] = useState(false)
  const client = useRoochClient()
  const { mutateAsync: signAndExecuteTransaction } = UseSignAndExecuteTransaction()

  useEffect(() => {
    if (assets && assets.length > 0) {
      const item = assets[0]
      setSelectValue(`${shortAddress(item.id)} | ${item.value} sats`)
      setSelectUTXO(item.id)
    } else {
      setAction('Not Found')
    }
  }, [assets])

  useEffect(() => {
    if (!selectUTXO) {
      return
    }

    if (actionLoading) {
      return
    }
    client
      .executeViewFunction({
        target: `${contractAddr}::${moduleName}::check_asset_is_staked`,
        args: [Args.objectId(selectUTXO)],
      })
      .then((result) => {
        if (result.vm_status !== 'Executed') {
          return
        }
        const stakeInfo = {
          staked: result.return_values![0].decoded_value as boolean,
          harvest: Number(result.return_values![1].decoded_value),
        }
        setStakeInfo(stakeInfo)

        if (stakeInfo.staked && stakeInfo.harvest > 1) {
          setAction('claim')
        } else if (stakeInfo.staked && stakeInfo.harvest === 0) {
          setAction('unStake')
        } else {
          setAction('stake')
        }
      })
  }, [client, contractAddr, selectUTXO, actionLoading])

  const handleAction = async (utxo?: string) => {
    const curUTXO = selectUTXO || utxo
    if (!curUTXO || action === 'Not Found') {
      return
    }
    if (!session) {
      setShowSessionModel(true)
      return
    }

    const tag = target === 'bbn' ? '_bbn' : ''

    setActionLoading(true)
    const func = `${contractAddr}::${moduleName}`
    let tx: Transaction
    switch (action) {
      case 'claim':
        tx = new Transaction()
        tx.callFunction({
          target: `${func}::harvest${tag}`,
          args: [Args.objectId(curUTXO)],
        })

        break
      case 'stake':
        tx = new Transaction()
        tx.callFunction({
          target: `${func}::stake${tag}`,
          args: [Args.objectId(curUTXO)],
        })

        break
      case 'unStake':
        tx = new Transaction()
        tx.callFunction({
          target: `${func}::unstake${tag}`,
          args: [Args.objectId(curUTXO)],
        })
    }

    try {
      const result = await signAndExecuteTransaction({
        transaction: tx,
      })

      if (result.execution_info.status.type === 'executed') {
        toast.success(`${action} success`)
      }
    } catch (e: any) {
      if (e.code === 1002) {
        setShowSessionModel(true)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleSelectChange = (value: string | null) => {
    if (value === null || value === selectValue) {
      return
    }

    setStakeInfo(undefined)
    setSelectValue(value)
    const data = value.trim().split('|')
    const idPart = data[0].split('...')
    const id = assets.find(
      (item) => item.id.startsWith(idPart[0].trim()) && item.id.endsWith(idPart[1].trim()),
    )
    setSelectUTXO(id!.id)
  }

  const handleAllAction = async (action: 'stake' | 'unStake' | 'claim') => {
    if (!session) {
      setShowSessionModel(true)
      return
    }

    const utxoIds = assets.map((item) => item.id)
    if (!utxoIds) {
      toast.error('Not found utxo')
      return
    }

    const tag = target === 'bbn' ? '_bbn' : ''

    setActionLoading(true)
    const func = `${contractAddr}::${moduleName}`
    let tx: Transaction
    switch (action) {
      case 'claim':
        tx = new Transaction()
        tx.callFunction({
          target: `${func}::batch_harvest${tag}`,
          args: [Args.vec('objectId', utxoIds)],
        })

        break
      case 'stake':
        tx = new Transaction()
        tx.callFunction({
          target: `${func}::batch_stake${tag}`,
          args: [Args.vec('objectId', utxoIds)],
        })

        break
      case 'unStake':
        tx = new Transaction()
        tx.callFunction({
          target: `${func}::batch_unstake${tag}`,
          args: [Args.vec('objectId', utxoIds)],
        })
    }

    try {
      const result = await signAndExecuteTransaction({
        transaction: tx,
      })

      if (result.execution_info.status.type === 'executed') {
        toast.success(`${action} success`)
      }
    } catch (e: any) {
      if (e.code === 1002) {
        setShowSessionModel(true)
      }
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Card flex={{ base: 'auto', sm: 3 }} withBorder bg="gray.0" radius="lg" p="lg">
      <CreateSessionModal isOpen={showSessionModel} onClose={() => setShowSessionModel(false)} />
      <Text fw="500">{target === 'bbn' ? 'Select Babylon Stake Seal' : 'Select UTXO'}</Text>
      <Select
        size="md"
        value={selectValue}
        data={assets.map((item) => `${shortAddress(item.id)} | ${item.value} sats`)}
        onChange={handleSelectChange}
        radius="md"
        comboboxProps={{ radius: 'md' }}
        mt="6"
      />
      {
        <Flex justify="space-between" mt="md">
          {action === 'claim' ? (
            <>
              <Text fw="500">Eligible $GROW</Text>
              <Text c="gray.7">{stakeInfo ? formatBalance(stakeInfo?.harvest) : '-'} $GROW</Text>
            </>
          ) : action === 'unStake' ? (
            <Text fw="500">No revenue has been generated</Text>
          ) : (
            <></>
          )}
        </Flex>
      }
      <Button
        size="md"
        radius="md"
        mt="md"
        onClick={() => handleAction()}
        loading={(action !== 'Not Found' && stakeInfo === undefined) || actionLoading}
      >
        {action === 'Not Found'
          ? target === 'bbn'
            ? 'Not Found Babylon Stake Seal'
            : 'Not Found UTXO'
          : action}
      </Button>
      {assets.length > 1 ? (
        <Flex justify="space-evenly" mt="md" style={{ width: '100%' }}>
          <Button
            size="md"
            radius="md"
            style={{ flexGrow: 1 }}
            onClick={() => handleAllAction('stake')}
          >
            stake all
          </Button>
          <Button
            size="md"
            radius="md"
            ml="md"
            mr="md"
            style={{ flexGrow: 1 }}
            onClick={() => handleAllAction('unStake')}
          >
            unStake all
          </Button>
          <Button
            size="md"
            radius="md"
            style={{ flexGrow: 1 }}
            onClick={() => handleAllAction('claim')}
          >
            claim all
          </Button>
        </Flex>
      ) : (
        <></>
      )}
    </Card>
  )
}
