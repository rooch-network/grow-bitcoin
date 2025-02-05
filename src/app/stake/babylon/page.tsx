// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import Link from 'next/link'
import { Anchor, Breadcrumbs, Container, Flex, Group, Stack, Text, Title } from '@mantine/core'
import DoubleHeader from '@/components/navigation-bar'
import Footer from '@/components/Footer'

import { IconHome } from '@tabler/icons-react'
import { useCurrentAddress, useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit'
import { StakeCard } from '@/components/stake-card'

export default function BabylonStakingPage() {
  const addr = useCurrentAddress()
  const { data: bbns } = useRoochClientQuery('queryObjectStates', {
    filter: {
      object_type_with_owner: {
        owner: addr?.toStr() || '',
        object_type: '0x4::bbn::BBNStakeSeal',
      },
    },
    queryOption: {
      decode: true,
    },
  })

  return (
    <>
      <DoubleHeader />

      <Container size="lg" pt="1rem" pb="16rem">
        <Breadcrumbs mb="3rem" p="md" bg="gray.0" style={{ borderRadius: '0.75rem' }}>
          <Anchor component={Link} href="/stake" c="dark" underline="never">
            <Group gap="4">
              <IconHome size="1rem" />
              <Text>Grow</Text>
            </Group>
          </Anchor>
          <Text>Babylon Staking</Text>
        </Breadcrumbs>

        <Flex align="center" gap="xl" wrap={{ base: 'wrap', sm: 'nowrap' }}>
          <Stack flex={{ base: 'auto', sm: 3 }} gap="sm">
            <Title order={2} fw="500">
              Get $GROW with Babylon Staking
            </Title>
            <Text c="gray.7">
              To get $GROW with Babylon staking, you will need to stake your BTC on the official
              Babylon Staking Dashboard.
            </Text>
            <Text c="gray.7">
              (y = x^(1/2) x is lock day, x not exceeding 1000, so y never over 31 and bbn stake
              weight is 22)
            </Text>
          </Stack>

          <StakeCard
            target={'bbn'}
            assets={
              bbns?.data.map((item) => {
                return {
                  id: item.id,
                  value: item.decoded_value?.value['staking_value'] as string,
                }
              }) || []
            }
          />
        </Flex>
      </Container>

      <Footer />
    </>
  )
}
