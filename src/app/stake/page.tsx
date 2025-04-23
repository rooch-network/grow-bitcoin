// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import Link from 'next/link'
import { Box, Button, Card, Container, Flex, Grid, Text, Title } from '@mantine/core'
import DoubleHeader from '@/components/navigation-bar'
import Footer from '@/components/Footer'

import Staking1SVG from '@/assets/staking-1.svg'
import Staking2SVG from '@/assets/staking-2.svg'
import Staking3SVG from '@/assets/staking-3.svg'
import { getTokenInfo, TokenInfo } from './util'
import { useCurrentAddress, useRoochClient, useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit'
import { useEffect, useMemo, useState } from 'react'
import { useNetworkVariable } from '../networks'
import { formatNumber } from '@/utils/number'
import { Args } from '@roochnetwork/rooch-sdk'
import { BigNumber } from 'bignumber.js'

const stakingList = [
  {
    img: <Staking1SVG />,
    title: 'Babylon Staking',
    description: "Stake your BTC in the Babylon's native self-custodial staking protocol.",
    link: {
      href: '/stake/babylon',
      label: 'Stake',
      icon: '',
    },
  },
  {
    img: <Staking2SVG style={{ objectFit: 'cover' }} />,
    title: 'LST/LRT Staking',
    description:
      'Stake your Bitcoin Liquid Staking Token or Bitcoin Liquid Restaking Token in smart contract with customized staking period.',
    link: {
      href: undefined,
      label: 'Coming Soon',
      icon: '',
    },
  },
  {
    img: <Staking3SVG />,
    title: 'Self Staking',
    description: 'Stake your BTC in your own wallet by holding it.',
    link: {
      href: '/stake/self',
      label: 'Stake',
      icon: '',
    },
  },
]

export default function GrowPage() {
  const client = useRoochClient()
  const addr = useCurrentAddress()
  const contractAddr = useNetworkVariable('contractAddr')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>()
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [balance, setBalance] = useState(0)
  useEffect(() => {
    getTokenInfo(client, contractAddr).then((result) => {
      setTokenInfo(result)
      setTimeRemaining(result.data.timeRemaining)
    })
  }, [client, contractAddr])

  useEffect(() => {
    if (!addr || !tokenInfo) {
      return
    }
    client
      .getBalance({
        coinType: tokenInfo.coinInfo.type,
        owner: addr.genRoochAddress().toStr() || '',
      })
      .then((result) => {
        setBalance(Number(result.balance))
      })
  }, [addr, client, tokenInfo])

  useEffect(() => {
    if (!tokenInfo) {
      return
    }
    const interval = setInterval(() => {
      const now = Date.now() / 1000
      setTimeRemaining(tokenInfo?.data.endTime - now)
    }, 1000)

    // Cleanup interval on component unmount
    return () => clearInterval(interval)
  }, [tokenInfo])

  const formatTimeRemaining = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${days} : ${hours} : ${minutes} : ${secs}`
  }

  const { data: btcPrice } = useRoochClientQuery('executeViewFunction', {
    target: `${contractAddr}::trusted_oracle::trusted_price`,
    args: [Args.string('BTCUSD')],
  })
  console.log(btcPrice)

  const { data: grow2Rgas } = useRoochClientQuery('executeViewFunction', {
    target: `${contractAddr}::router::get_amount_out`,
    args: [Args.u64(BigInt(1))],
    typeArgs: [`${contractAddr}::grow_bitcoin::GROW`, '0x3::gas_coin::RGas'],
  })
  console.log(grow2Rgas)
  // 6 dec
  const { data: rgas2USD } = useRoochClientQuery('executeViewFunction', {
    target: `${contractAddr}::router::get_amount_out`,
    args: [Args.u64(BigInt(10000000))],
    typeArgs: ['0x3::gas_coin::RGas', `${contractAddr}::usdt_f::USDT`],
  })

  const s = useMemo(() => {
    if (!grow2Rgas || !rgas2USD || !tokenInfo) {
      return '0'
    }
    const btcPriceValue = btcPrice!.return_values![0].decoded_value as number
    // 1 btc grow / 1 year
    const grow2RGasCount = grow2Rgas!.return_values![0].decoded_value as number
    const rgas2USDCount = rgas2USD!.return_values![0].decoded_value as number

    // 1 BTC GROW / 1 year
    const growCount = new BigNumber(tokenInfo.data.releasePerSecond)
      .div(tokenInfo.data.assetTotalWeight)
      .times(BigNumber(10).pow(9))
      .times(31536000)
    console.log(growCount.toString())

    const xPrice = new BigNumber(btcPriceValue)
    console.log(xPrice.toString())

    const yPrice = growCount
      .times(BigNumber(grow2RGasCount).div(new BigNumber(10).pow(8)))
      .times(BigNumber(rgas2USDCount).div(new BigNumber(10).pow(6)))
    console.log(yPrice.toString())
    return yPrice.div(xPrice).times(100).toFixed(3)
  }, [btcPrice, grow2Rgas, rgas2USD, tokenInfo])

  return (
    <>
      <DoubleHeader />
      <Container pt="1rem" pb="4rem" size="lg">
        <Card radius="lg" p="lg" bg="gray.0" mb="2rem">
          <Flex justify="space-between">
            <Box>
              <Title order={4} fw="500">
                $GROW Info
              </Title>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>Time Remaining :</span>
                <span>{tokenInfo ? formatTimeRemaining(timeRemaining) : '-'}</span>
              </Text>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>Total stake :</span>
                <span>{tokenInfo ? formatNumber(tokenInfo?.data.assetTotalWeight) : '-'} stas</span>
              </Text>
              <Text mt="4" c="gray.7" style={{ display: 'flex' }}>
                <span style={{ minWidth: '150px' }}>APR :</span>
                <span>{s}%</span>
                <span style={{ marginLeft: '10px', color: 'red' }}>&#9432;</span>
              </Text>
            </Box>

            {balance > 0 ? (
              <Box ta="right">
                <Title order={4} fw="500">
                  {formatNumber(balance)} $GROW
                </Title>
                <Text mt="4" c="gray.7"></Text>
                <Text mt="4" c="gray.7">
                  Your Balance
                </Text>
              </Box>
            ) : (
              <></>
            )}
          </Flex>
        </Card>
        <Card radius="lg" p="lg" bg="gray.0" mb="2rem">
          <Flex justify="space-between">
            <Box>
              <Title order={4} fw="500">
                Get $GROW with BTC Staking
              </Title>
              <Text mt="4" c="gray.7">
                Choose your choice of BTC staking
              </Text>
            </Box>
          </Flex>
        </Card>

        <Grid gutter="lg">
          {stakingList.map((i) => (
            <Grid.Col key={i.title} span={{ base: 12, md: 6 }}>
              <Card withBorder h="100%" bg="gray.0" radius="lg" p="md">
                <Flex gap={{ base: '0', xs: 'lg' }} wrap={{ base: 'wrap', xs: 'nowrap' }}>
                  <Box w={160} flex="none">
                    {i.img}
                  </Box>
                  <Box pt="xs">
                    <Title order={3} fw="500">
                      {i.title}
                    </Title>
                    <Text size="md" mt="4" mb="xs" c="grqqay.7">
                      {i.description}
                    </Text>
                    {!i.link.href ? (
                      <Button disabled radius="md" w="148">
                        Coming Soon
                      </Button>
                    ) : (
                      <Button component={Link} href={i.link.href} radius="md" w="148">
                        {i.link.label}
                      </Button>
                    )}
                  </Box>
                </Flex>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      <Footer />
    </>
  )
}
