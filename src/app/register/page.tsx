// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { Box, Button, Card, Container, Flex, Input, Text, Title } from '@mantine/core'

import DoubleHeader from '@/components/navigation-bar'
import {
  SessionKeyGuard,
  useCurrentAddress,
  useRoochClient,
  useSignAndExecuteTransaction,
} from '@roochnetwork/rooch-sdk-kit'
import React, { useCallback, useEffect, useState } from 'react'
import { useNetworkVariable } from '@/app/networks'
import { Args, Transaction } from '@roochnetwork/rooch-sdk'
import toast from 'react-hot-toast'
import { useCountDown } from 'ahooks'

const RegProjects = []

type RegistrationType = {
  projectId: string
  startTime: number
  endTime: number
}

interface ItemProps {
  name: string
  hint: string
  endTime: number
  id: string
  order: string
  root: string
  hash: string
  snapshoot: Array<any>
}

const Item = (item: ItemProps) => {
  const { name, endTime, id, order, hash, root } = item
  const client = useRoochClient()
  const curAddress = useCurrentAddress()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()
  const contractVersion = useNetworkVariable('contractVersion')
  const contractAddr = useNetworkVariable('contractAddr')

  const [registration, setRegistration] = useState<RegistrationType>()
  const [index, setIndex] = useState(-2)
  const [recipient, setRecipient] = useState('')
  // const [timeRemaining, setTimeRemaining] = useState(-1)
  const [registerRecipient, setRegisterRecipient] = useState('')

  const [_countdown, formattedRes] = useCountDown({
    targetDate: endTime * 1000,
  })

  const { days, hours, minutes, seconds } = formattedRes

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     const now = Date.now() / 1000
  //     setTimeRemaining(endTime - now)
  //   }, 1000)
  //
  //   // Cleanup interval on component unmount
  //   return () => clearInterval(interval)
  // }, [endTime])

  const init = useCallback(async () => {
    if (!curAddress) {
      return
    }
    const result = await client.queryObjectStates({
      filter: {
        object_id: id,
      },
    })

    const projectId = result.data[0].decoded_value?.value['project_id'] as string
    setRegistration({
      projectId: projectId === 'pan' ? 'Pan_Ecosystem' : projectId,
      startTime: result.data[0].decoded_value?.value['start_time'] as number,
      endTime: result.data[0].decoded_value?.value['end_time'] as number,
    })

    const registerResult = await client.executeViewFunction({
      target: `${contractAddr}::grow_registration::get_user_info`,
      args: [Args.objectId(id), Args.address(curAddress!.genRoochAddress().toHexAddress())],
    })

    if (registerResult.vm_status === 'Executed') {
      const addr = registerResult.return_values![0].value.value
      if (addr !== '0x00') {
        setRegisterRecipient(registerResult.return_values![0].decoded_value as string)
      }
    }

    let index = item.snapshoot.findIndex(
      (item) =>
        item.btcAddress === curAddress?.toStr() ||
        item.address === curAddress.genRoochAddress().toHexAddress() ||
        item.roochAddress === curAddress.genRoochAddress().toBech32Address(),
    )

    if (index !== -1) {
      index += 1
    }
    setIndex(index)
  }, [curAddress, client, id, contractAddr, item.snapshoot])

  useEffect(() => {
    init()
  }, [init])

  const queryPointBox = async () => {
    const result_1 = await client.queryObjectStates({
      filter: {
        object_type_with_owner: {
          object_type: `${contractAddr}::grow_point_${contractVersion}::PointBox`,
          owner: curAddress!.toStr(),
        },
      },
      limit: '200',
    })
    return result_1.data
      .map((item) => {
        return {
          id: item.id,
          project_id: item.decoded_value?.value['project_id'] as string,
          timestamp: item.decoded_value?.value['timestamp'] as number,
          vote: item.decoded_value?.value['value'] as number,
        }
      })
      .filter((item_1) => {
        return (
          item_1.project_id.toLowerCase() === registration!.projectId.toLowerCase() &&
          item_1.vote > 0 &&
          item_1.timestamp > registration!.startTime &&
          item_1.timestamp < registration!.endTime
        )
      })
      .sort((a, b) => a.timestamp - b.timestamp)
  }

  const handleSubmit = async () => {
    const tx = new Transaction()

    if (registerRecipient !== '') {
      tx.callFunction({
        target: `${contractAddr}::grow_registration::update_register_info`,
        args: [Args.objectId(id), Args.string(recipient)],
      })
    } else {
      const points = await queryPointBox()
      if (points.length === 0) {
        toast.error('not found valid votes')
        return
      }

      tx.callFunction({
        target: `${contractAddr}::grow_registration::register_batch`,
        args: [
          Args.objectId(id),
          Args.vec(
            'objectId',
            points.map((point) => point.id),
          ),
          Args.string(recipient),
        ],
      })
    }

    mutateAsync({
      transaction: tx,
    })
      .then((result) => {
        if (result.execution_info.status.type === 'executed') {
          toast.success('register success')
          setRegisterRecipient(recipient)
        } else {
          toast.error(result.error_info?.vm_error_info.error_message || 'unknown error')
        }
      })
      .catch((e: any) => {
        console.log(e)
      })
  }

  return (
    <>
      <Card radius="lg" p="lg" bg="gray.0" mb="2rem">
        <Flex justify="space-between">
          <Box>
            <Title order={4} fw="500">
              {name} Snapshoot Info
            </Title>
            <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
              <span style={{ minWidth: '150px' }}>TX Order :</span>
              <span>{order}</span>
            </Text>
            <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
              <span style={{ minWidth: '150px' }}>TX Hash :</span>
              <span>{hash}</span>
            </Text>
            <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
              <span style={{ minWidth: '150px' }}>State Root :</span>
              <span>{root}</span>
            </Text>
            <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
              <span style={{ minWidth: '150px' }}>Time Remaining :</span>
              <span>
                {days}D {hours}H {minutes}M {seconds}S
              </span>
            </Text>
          </Box>
        </Flex>
      </Card>

      <Card radius="lg" p="lg" bg="gray.0" mb="2rem">
        <Box>
          <Title order={4} fw="500">
            {!curAddress && 'Please connect your wallet first'}
            {curAddress && index === -2 && 'Checking your eligibility...'}
            {curAddress && index === -1 && 'Unfortunately, you are not eligible for the airdrop.'}
            {curAddress && index > 0 && 'Congratulations! You are eligible for the airdrop.'}
          </Title>
        </Box>
        {index > 0 && (
          <Flex mt="10" gap="md" direction={{ base: 'column', xs: 'row' }}>
            <Input
              flex={1}
              placeholder={registerRecipient ? registerRecipient : item.hint}
              radius="md"
              value={recipient}
              onChange={(e) => setRecipient(e.currentTarget.value)}
            />
            <SessionKeyGuard onClick={handleSubmit}>
              <Button radius="md" loading={isPending} disabled={recipient === ''}>
                {registerRecipient ? 'update' : 'Submit'}
              </Button>
            </SessionKeyGuard>
          </Flex>
        )}
      </Card>
    </>
  )
}

export default function Register() {
  return (
    <>
      <DoubleHeader />
      <Container pt="1rem" pb="4rem" size="lg">
        {RegProjects.map((item) => {
          return (
            <Item
              name={item.name}
              hint={item.hint}
              key={item.name}
              id={item.id}
              endTime={item.endTime}
              order={item.order}
              hash={item.hash}
              root={item.root}
              snapshoot={item.snapshoot}
            />
          )
        })}
      </Container>
    </>
  )
}
