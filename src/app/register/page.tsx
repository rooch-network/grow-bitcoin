// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { Box, Button, Card, Container, Flex, Input, Text, Title } from '@mantine/core'

import NavigationBar from '@/components/NavigationBar'
import {
  SessionKeyGuard,
  useCurrentAddress,
  useRoochClient,
  useSignAndExecuteTransaction,
} from '@roochnetwork/rooch-sdk-kit'
import { snapshoot } from '@/app/constant'
import React, { useCallback, useEffect, useState } from 'react'
import { useNetworkVariable } from '@/app/networks'
import { Args, Transaction } from '@roochnetwork/rooch-sdk'
import toast from 'react-hot-toast'

// tmp info
const EDN_TIME = 1736337600
const UXLINK_ID = '0x2a689e096ed5aae569a3bdb42e16c828ef367360425d1d85a6dead2b63b177a4'

type RegistrationType = {
  projectId: string
  startTime: number
  endTime: number
}

const formatTimeRemaining = (seconds: number) => {
  const days = Math.floor(seconds / (24 * 3600))
  const hours = Math.floor((seconds % (24 * 3600)) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  return `${days}D : ${hours}H : ${minutes}M : ${secs}S`
}
export default function Register() {
  const client = useRoochClient()
  const curAddress = useCurrentAddress()
  const { mutateAsync, isPending } = useSignAndExecuteTransaction()
  const contractVersion = useNetworkVariable('contractVersion')
  const contractAddr = useNetworkVariable('contractAddr')

  const [registration, setRegistration] = useState<RegistrationType>()
  const [index, setIndex] = useState(-2)
  const [recipient, setRecipient] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(-1)
  const [registerRecipient, setRegisterRecipient] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now() / 1000
      setTimeRemaining(EDN_TIME - now)
    }, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [])

  const init = useCallback(async () => {
    if (!curAddress) {
      return
    }
    const result = await client.queryObjectStates({
      filter: {
        object_id: UXLINK_ID,
      },
    })

    setRegistration({
      projectId: result.data[0].decoded_value?.value['project_id'] as string,
      startTime: result.data[0].decoded_value?.value['start_time'] as number,
      endTime: result.data[0].decoded_value?.value['end_time'] as number,
    })

    const registerResult = await client.executeViewFunction({
      target: `${contractAddr}::grow_registration::get_user_info`,
      args: [Args.objectId(UXLINK_ID), Args.address(curAddress!.genRoochAddress().toHexAddress())],
    })

    if (registerResult.vm_status === 'Executed') {
      const addr = registerResult.return_values![0].value.value
      if (addr !== '0x00') {
        setRegisterRecipient(registerResult.return_values![0].decoded_value as string)
      }
    }

    let index = snapshoot.findIndex(
      (item) =>
        item.btcAddress === curAddress?.toStr() ||
        item.address === curAddress.genRoochAddress().toHexAddress() ||
        item.roochAddress === curAddress.genRoochAddress().toBech32Address(),
    )

    if (index !== -1) {
      index += 1
    }
    setIndex(index)
  }, [curAddress, client, contractAddr])

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
          item_1.project_id === registration!.projectId &&
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
        args: [Args.objectId(UXLINK_ID), Args.string(recipient)],
      })
    } else {
      const points = await queryPointBox()
      if (points.length === 0) {
        return
      }

      tx.callFunction({
        target: `${contractAddr}::grow_registration::register_batch`,
        args: [
          Args.objectId(UXLINK_ID),
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
      <NavigationBar />
      <Container pt="1rem" pb="4rem" size="lg">
        <Card radius="lg" p="lg" bg="gray.0" mb="2rem">
          <Flex justify="space-between">
            <Box>
              <Title order={4} fw="500">
                UXLink Snapshoot Info
              </Title>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>TX Order :</span>
                <span>72730361</span>
              </Text>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>TX Hash :</span>
                <span>0x54adf5ddc03b1083f9146645e1d7ecaa5b272a66c449a96ec82f38073713c382</span>
              </Text>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>State Root :</span>
                <span>0x42d23fdaaf5ec6cd62c7f6f2ba527e397ea3d45d8c1f9d5956054aa8b8122271</span>
              </Text>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>Time Remaining :</span>
                <span>{timeRemaining < 0 ? '-' : formatTimeRemaining(timeRemaining)}</span>
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
          <Flex direction={'row'}>
            <Text color="red">Note: Your receiving address needs to interact with </Text>
            <a
              href="https://dapp.uxlink.io/season2"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 3,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                color: 'ff9909',
              }}
            >
              UXLink
            </a>
          </Flex>
          {index > 0 && (
            <Flex mt="10" gap="md" direction={{ base: 'column', xs: 'row' }}>
              <Input
                flex={1}
                placeholder={
                  registerRecipient
                    ? registerRecipient
                    : 'Please enter the address to receive the UXLink airdrop (EVM or TON)'
                }
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
      </Container>
    </>
  )
}
