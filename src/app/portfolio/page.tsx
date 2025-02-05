// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Anchor,
  Box,
  Card,
  Center,
  CloseButton,
  Container,
  Flex,
  Grid,
  Input,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core'
import Link from 'next/link'

import DoubleHeader from '@/components/navigation-bar'
import Footer from '@/components/Footer'

import {
  IconSearch,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react'
import { getTokenInfo } from '@/app/stake/util'
import { useCurrentAddress, useRoochClient } from '@roochnetwork/rooch-sdk-kit'
import { useNetworkVariable } from '@/app/networks'
import { AnnotatedMoveStructView } from '@roochnetwork/rooch-sdk/src/client/types/generated'
import { formatNumber } from '@/utils/number'

function TableButton({
  active,
  order,
  onClick,
  children,
}: {
  active: boolean
  order: 'ASC' | 'DESC'
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      {children}
      {active ? (
        order === 'ASC' ? (
          <IconSortAscending size="1rem" />
        ) : (
          <IconSortDescending size="1rem" />
        )
      ) : (
        <IconArrowsSort size="1rem" opacity={0.5} />
      )}
    </UnstyledButton>
  )
}

type VotedProject = {
  id: string
  value: number
}

export default function Portfolio() {
  const [sortColumn, setSortColumn] = useState('name')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC')
  const [searchKeyword, setSearchKeyword] = useState<string>('')
  const client = useRoochClient()
  const addr = useCurrentAddress()
  const contractAddr = useNetworkVariable('contractAddr')
  const [votedCount, setVoteCount] = useState(0)
  const [balance, setBalance] = useState(0)
  const [RGasBalance, setRGasBalance] = useState(0)
  const contractVersion = useNetworkVariable('contractVersion')
  const [votedProjects, setVotedProjects] = useState<Array<VotedProject>>([])

  useEffect(() => {
    if (!addr) {
      return
    }

    client
      .getStates({
        accessPath: `/resource/${addr.genRoochAddress().toHexAddress()}/${contractAddr}::grow_information_${contractVersion}::UserVoteInfo`,
        stateOption: {
          decode: true,
        },
      })
      .then((result) => {
        if (result.length > 0 && result[0].decoded_value) {
          const view = (
            (result[0].decoded_value?.value['value'] as AnnotatedMoveStructView).value[
              'vote_info'
            ] as AnnotatedMoveStructView
          ).value['handle'] as AnnotatedMoveStructView
          const id = view.value['id']

          client
            .listStates({
              accessPath: `/table/${id}`,
              stateOption: {
                decode: true,
              },
            })
            .then((result) => {
              let count = 0
              const items = result.data.map((item) => {
                const view = item.state.decoded_value!.value
                const vote = Number(view!['value'])
                count += vote
                return {
                  id: view!['name'] as string,
                  value: vote,
                }
              })
              setVoteCount(count)
              setVotedProjects(items)
              console.log(result)
            })
          console.log(view.value['id'])
        }
        console.log(result)
      })

    // client.queryObjectStates({
    // 	filter: {
    // 		object_type_with_owner: {
    // 			owner: addr.toStr(),
    // 			object_type: `${contractAddr}::grow_point_${contractVersion}::PointBox`
    // 		}
    // 	},
    // 	queryOption: {
    // 		decode: true
    // 	}
    // }).then((result) => {
    // 	const items = result.data
    // 		.map((item) => item.decoded_value?.value)
    // 		.filter((view) => view !== undefined)
    // 		.map((view) => ({
    // 			id: view!['project_id'] as string,
    // 			timestamp: view!['timestamp'] as string,
    // 			value: Number(view!['value'])
    // 		}));
    //
    // 		setVotedProjects(items)
    // })

    client
      .getBalance({ owner: addr.genRoochAddress().toStr(), coinType: '0x3::gas_coin::RGas' })
      .then((result) => {
        setRGasBalance(Math.floor(Number(result.balance) / Math.pow(10, result.decimals)))
      })

    getTokenInfo(client, contractAddr).then((result) => {
      client
        .getBalance({
          coinType: result.coinInfo.type,
          owner: addr.genRoochAddress().toStr(),
        })
        .then((result) => {
          setBalance(Number(result.balance))
        })
    })
  }, [client, contractAddr, addr, setVotedProjects, contractVersion])
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortColumn(column)
      setSortOrder('ASC')
    }
  }

  const sortedAndFilteredEntries = useMemo(() => {
    const sortedEntries = [...votedProjects].sort((a, b) => {
      let comparison = 0
      if (sortColumn === 'NAME') {
        comparison = a.id.localeCompare(b.id)
      } else if (sortColumn === 'VOTES') {
        comparison = a.value - b.value
      } else if (sortColumn === 'EARNED') {
        comparison = a.value - b.value
      }
      return sortOrder === 'ASC' ? comparison : -comparison
    })

    if (!searchKeyword) return sortedEntries

    return sortedEntries.filter((entry) =>
      entry.id.toLowerCase().includes(searchKeyword.toLowerCase()),
    )
  }, [votedProjects, searchKeyword, sortColumn, sortOrder])

  return (
    <>
      <DoubleHeader />

      <Container size="lg" py="xl">
        <Box>
          <Title order={3}>My Portfolio</Title>
          <Grid mt="md" gutter="lg">
            <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
              <Card radius="lg" withBorder>
                <Flex align="center" justify="space-between">
                  <Title order={6} c="gray.7">
                    $GROW Balance
                  </Title>
                </Flex>
                <Text size="2rem" lh="2.5rem" mt="4">
                  {balance === 0 ? '-' : formatNumber(balance)}
                </Text>
                {/*<Text size="sm" c="gray.7">*/}
                {/*  $GROW tokens*/}
                {/*</Text>*/}
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
              <Card radius="lg" withBorder>
                <Flex align="center" justify="space-between">
                  <Title order={6} c="gray.7">
                    $RGAS Balance
                  </Title>
                </Flex>
                <Text size="2rem" lh="2.5rem" mt="4">
                  {RGasBalance === 0 ? '-' : formatNumber(RGasBalance)}
                </Text>
                {/*<Text size="sm" c="gray.7">*/}
                {/*  $GROW tokens*/}
                {/*</Text>*/}
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
              <Card radius="lg" withBorder>
                <Flex align="center" justify="space-between">
                  <Title order={6} c="gray.7">
                    Total BitXP Earned
                  </Title>
                </Flex>
                <Text size="2rem" lh="2.5rem" mt="4">
                  {votedCount === 0 ? '-' : formatNumber(votedCount)}
                </Text>
                {/*<Text size="sm" c="gray.7">*/}
                {/*  $GROW tokens*/}
                {/*</Text>*/}
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
              <Card radius="lg" withBorder>
                <Flex align="center" justify="space-between">
                  <Title order={6} c="gray.7">
                    Projects Voted
                  </Title>
                </Flex>
                <Text size="2rem" lh="2.5rem" mt="4">
                  {votedProjects.length === 0 ? '-' : votedProjects.length}
                </Text>
                {/*<Text size="sm" c="gray.7">*/}
                {/*  $GROW tokens*/}
                {/*</Text>*/}
              </Card>
            </Grid.Col>
          </Grid>
        </Box>

        <Box mt="3rem">
          <Flex
            align={{ base: 'unset', xs: 'center' }}
            justify="space-between"
            direction={{ base: 'column', xs: 'row' }}
            gap="xs"
          >
            <Title order={3}>Voted Projects</Title>
            <Input
              leftSection={<IconSearch size="1.25rem" />}
              radius="md"
              placeholder="Search projects..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.currentTarget.value)}
              rightSectionPointerEvents="all"
              rightSection={
                <CloseButton
                  aria-label="Clear input"
                  onClick={() => setSearchKeyword('')}
                  style={{ display: searchKeyword ? undefined : 'none' }}
                />
              }
            />
          </Flex>
          <Card mt="md" p="0" radius="lg" style={{ overflowX: 'auto' }} withBorder>
            <Table w="100%" miw="max-content">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th px="lg" py="md">
                    <TableButton
                      active={sortColumn === 'NAME'}
                      order={sortOrder}
                      onClick={() => handleSort('NAME')}
                    >
                      Project Name
                    </TableButton>
                  </Table.Th>
                  <Table.Th px="lg" py="md">
                    <TableButton
                      active={sortColumn === 'VOTES'}
                      order={sortOrder}
                      onClick={() => handleSort('VOTES')}
                    >
                      Votes
                    </TableButton>
                  </Table.Th>
                  <Table.Th px="lg" py="md">
                    <TableButton
                      active={sortColumn === 'EARNED'}
                      order={sortOrder}
                      onClick={() => handleSort('EARNED')}
                    >
                      XP Earned
                    </TableButton>
                  </Table.Th>
                  <Table.Th px="lg" py="md" ta="right">
                    Action
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {sortedAndFilteredEntries.length ? (
                  sortedAndFilteredEntries.map((element) => (
                    <Table.Tr key={element.id}>
                      <Table.Td p="lg">{element.id}</Table.Td>
                      <Table.Td p="lg">{formatNumber(element.value)}</Table.Td>
                      <Table.Td p="lg">{formatNumber(element.value)}</Table.Td>
                      <Table.Td p="lg" ta="right">
                        <Anchor component={Link} href={`/project/${element.id}`} size="sm">
                          View
                        </Anchor>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={4} p="lg">
                      <Center>
                        <Text c="gray.6">No projects found.</Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Card>
        </Box>
      </Container>

      <Footer />
    </>
  )
}
