// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Image,
  Input,
  Table,
  Text,
  Title,
  Tooltip,
  Pagination,
  Select,
} from '@mantine/core'
import Link from 'next/link'
import NavigationBar from '@/components/NavigationBar'
import Footer from '@/components/Footer'

import { IconChevronLeft, IconThumbUp, IconExternalLink } from '@tabler/icons-react'
import {
  SessionKeyGuard,
  useCurrentAddress,
  useCurrentSession,
  useRoochClient,
  useRoochClientQuery,
} from '@roochnetwork/rooch-sdk-kit'
import { Args, RoochAddress, Transaction } from '@roochnetwork/rooch-sdk'
import { AnnotatedMoveStructView } from '@roochnetwork/rooch-sdk/src/client/types/generated'
import { useEffect, useMemo, useState } from 'react'
import { getTokenInfo } from '@/app/stake/util'
import { useNetworkVariable } from '@/app/networks'
import { formatNumber } from '@/utils/number'
import Markdown from 'react-markdown'
import toast from 'react-hot-toast'

import 'github-markdown-css'

const getRankEmoji = (index: number) => {
  switch (index) {
    case 0:
      return '🥇'
    case 1:
      return '🥈'
    case 2:
      return '🥉'
    default:
      return index + 1 // Adjust for 1-based index
  }
}
export default function ProjectDetail({ project }: { project: ProjectDetail }) {
  const session = useCurrentSession()
  const contractAddr = useNetworkVariable('contractAddr')
  const contractVersion = useNetworkVariable('contractVersion')
  const [initVoteData, setInitVoteData] = useState(false)
  const [initVoteDataFinish, setInitVoteDataFinish] = useState(false)
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [balance, setBalance] = useState(-1)
  const [amount, setAmount] = useState('1')
  const [voters, setVoters] = useState<Array<VoterInfo>>([])
  const client = useRoochClient()
  const addr = useCurrentAddress()
  const moduleName = `${contractAddr}::grow_information_${contractVersion}`
  const [loading, setLoading] = useState(false)
  const [myVoteCount, setMyVoteCount] = useState('-')
  const [myRank, setMyRank] = useState<number>()
  const projectListObj = Args.object({
    address: contractAddr,
    module: `grow_information_${contractVersion}`,
    name: 'GrowProjectList',
  })
  const roochAddressHex = useMemo(() => {
    if (addr) {
      return addr.genRoochAddress().toHexAddress()
    } else {
      return ''
    }
  }, [addr])

  const { data, refetch } = useRoochClientQuery('executeViewFunction', {
    target: `${moduleName}::borrow_grow_project`,
    args: [projectListObj, Args.string(project.slug)],
  })

  useEffect(() => {
    if (!addr) {
      return
    }
    getTokenInfo(client, contractAddr).then((result) => {
      client
        .getBalance({
          coinType: result.coinInfo.type,
          owner: addr.genRoochAddress().toStr() || '',
        })
        .then((result) => {
          setBalance(Number(result.balance))
        })
    })
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
              for (let item of result.data) {
                const view = item.state.decoded_value!.value
                const name = view!['name'] as string

                if (name === project.slug) {
                  const vote = view!['value'] as string
                  setMyVoteCount(vote)
                  break
                }
              }
            })
        }
      })
  }, [addr, data, client, contractVersion, contractAddr])

  useEffect(() => {
    if (!data || data.vm_status !== 'Executed') {
      return
    }

    if (initVoteData) {
      return
    }

    setInitVoteData(true)

    const _voteDetail = (data.return_values![0].decoded_value as AnnotatedMoveStructView).value[
      'vote_detail'
    ] as AnnotatedMoveStructView
    const tableHandle = (_voteDetail.value.handle as AnnotatedMoveStructView).value['id'] as string
    getAllVoters(tableHandle)
  }, [data, initVoteData, setInitVoteData])

  useEffect(() => {
    if (!roochAddressHex || !initVoteDataFinish) {
      return
    }
    voters.find((item, i) => {
      if (item.address === roochAddressHex) {
        setMyRank(i)
      }
    })
  }, [voters, roochAddressHex])

  const handleVote = async (especial?: number) => {
    setLoading(true)
    const tx = new Transaction()
    tx.callFunction({
      target: `${moduleName}::vote_entry`,
      args: [projectListObj, Args.string(project.slug), Args.u256(BigInt(especial || amount))],
    })
    try {
      const reuslt = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session!,
      })

      if (reuslt.execution_info.status.type === 'executed') {
        toast.success('vote success')
        await refetch()
      }
    } catch (e: any) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }

  const getAllVoters = async (tabel: string, cursor?: string) => {
    const result = await client.listStates({
      accessPath: `/table/${tabel}`,
      stateOption: {
        decode: true,
      },
      cursor,
      limit: '100',
    })

    const items = result.data.map((item) => {
      const view = item.state.decoded_value!.value
      return {
        address: view.name.toString(),
        value: Number(view.value),
      }
    })

    setVoters((prev: VoterInfo[]) => {
      const seenAddresses = new Set<string>()
      const uniqueVoters: VoterInfo[] = []

      // First add all previous voters
      prev.forEach((voter) => {
        if (!seenAddresses.has(voter.address)) {
          seenAddresses.add(voter.address)
          uniqueVoters.push(voter)
        }
      })

      // Then add new items if they haven't been seen
      items.forEach((voter) => {
        if (!seenAddresses.has(voter.address)) {
          seenAddresses.add(voter.address)
          uniqueVoters.push(voter)
        }
      })

      // Stable sort that maintains relative order for equal values
      return uniqueVoters.sort((a, b) => {
        const diff = b.value - a.value
        if (diff === 0) {
          // If values are equal, maintain their original order
          return uniqueVoters.indexOf(a) - uniqueVoters.indexOf(b)
        }
        return diff
      })
    })

    if (result.has_next_page) {
      getAllVoters(tabel, result.next_cursor || undefined)
    } else {
      setInitVoteDataFinish(true)
    }
  }

  return (
    <>
      <NavigationBar />
      <Container size="sm" py="xl">
        <Anchor component={Link} href="/projects" mb="md">
          <IconChevronLeft />
          Back to projects
        </Anchor>
        <Card mt="sm" radius="lg" withBorder>
          <Group align="center">
            <Image src={project.avatar} alt="avatar" w="80" miw="80" h="80" radius="lg" />
            <Box>
              <Title order={2}>{project.name}</Title>
              <Text c="gray.7">{project.oneLiner}</Text>
            </Box>
          </Group>
          <Box mt="lg">
            <Markdown
              className="markdown-body"
              components={{
                p: ({ children }) => (
                  <Text mt="xs" mb="xs">
                    {children}
                  </Text>
                ),
                h1: ({ children }) => (
                  <Title order={1} mt="lg" mb="md">
                    {children}
                  </Title>
                ),
                h2: ({ children }) => (
                  <Title order={2} mt="lg" mb="md">
                    {children}
                  </Title>
                ),
                h3: ({ children }) => (
                  <Title order={3} mt="lg" mb="md">
                    {children}
                  </Title>
                ),
                ul: ({ children }) => (
                  <Box component="ul" ml="md" mt="xs" mb="xs">
                    {children}
                  </Box>
                ),
                li: ({ children }) => (
                  <Text component="li" mt="xs">
                    {children}
                  </Text>
                ),
                a: ({ href, children }) => (
                  <Anchor href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </Anchor>
                ),
              }}
            >
              {project.description}
            </Markdown>
          </Box>

          <Box mt="lg">
            <Title order={3}>Tags</Title>
            <Group mt="8">
              {project.tags.map((tag) => (
                <Badge key={tag} bg="dark.3">
                  {tag}
                </Badge>
              ))}
            </Group>
          </Box>

          <Group mt="lg">
            <Anchor
              href={project.website}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              Visit Website <IconExternalLink size="1em" />
            </Anchor>
            <Anchor
              href={project.twitter}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
            >
              Twitter <IconExternalLink size="1em" />
            </Anchor>
            {!project.github ? (
              <></>
            ) : (
              <Anchor
                href={project.github}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}
              >
                Github <IconExternalLink size="1em" />
              </Anchor>
            )}
          </Group>
          {data?.vm_status === 'Executed' ? (
            <>
              <Flex
                align={{ base: 'unset', xs: 'center' }}
                justify="space-between"
                gap="xs"
                mt="xl"
                direction={{ base: 'column', xs: 'row' }}
              >
                <SessionKeyGuard
                  onClick={() => {
                    handleVote(1)
                  }}
                >
                  <Button variant="outline" leftSection={<IconThumbUp size="1.5em" />} radius="xl">
                    {formatNumber(
                      (data!.return_values![0].decoded_value as AnnotatedMoveStructView).value[
                        'vote_value'
                      ] as number,
                    )}
                  </Button>
                </SessionKeyGuard>
                <Group gap="0">
                  <Input
                    flex={1}
                    placeholder="Amount"
                    radius="md"
                    disabled={!addr || balance === 0}
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value)
                    }}
                    styles={{
                      input: {
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        borderRight: 0,
                      },
                    }}
                  />
                  <SessionKeyGuard onClick={() => handleVote()}>
                    <Button
                      radius="md"
                      disabled={!addr || balance === 0 || amount === ''}
                      loading={loading}
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      Vote
                    </Button>
                  </SessionKeyGuard>
                </Group>
              </Flex>
              <Flex ta="right" gap="xs" justify="flex-end" mt="6" c="gray.7">
                {addr ? (
                  <>
                    <Text size="sm">{`Your $GROW Balance: ${balance === -1 ? '-' : formatNumber(balance)}`}</Text>
                    {balance === 0 ? (
                      <Link href={'/stake'} style={{ color: 'inherit', fontSize: 'smaller' }}>
                        <Text size="sm">To Stake</Text>
                      </Link>
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <Text size="sm">Please connect your wallet first</Text>
                )}
              </Flex>
            </>
          ) : (
            <></>
          )}
        </Card>
      </Container>
      <Center>
        {myRank ? `You are ranked ${getRankEmoji(myRank)},` : 'Your'} vote total:{' '}
        {myVoteCount === '-' ? myVoteCount : Intl.NumberFormat('en-us').format(Number(myVoteCount))}
      </Center>
      <Container size="sm" py="xl">
        <Card mt="sm" radius="lg" withBorder>
          <Flex direction="column">
            <Title order={3} ta="center" mb="md">
              Voter List - <b>{voters.length}</b> have voted!
            </Title>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Ranking</Table.Th>
                  <Table.Th>Address</Table.Th>
                  <Table.Th ta="right">Votes</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {initVoteDataFinish && voters.length ? (
                  voters.slice(page * pageSize, (page + 1) * pageSize).map((voter, index) => (
                    <Table.Tr key={voter.address}>
                      <Table.Td>{getRankEmoji(page * pageSize + index)}</Table.Td>
                      <Table.Td>
                        <Tooltip label={new RoochAddress(voter.address).toStr()} withArrow>
                          <span>
                            {new RoochAddress(voter.address).toShortStr({
                              start: 40,
                              end: 6,
                            })}
                            {voter.address === roochAddressHex && ' 👤'}
                          </span>
                        </Tooltip>
                      </Table.Td>
                      <Table.Td ta="right">
                        <Text style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {Intl.NumberFormat('en-us').format(voter.value)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td>-</Table.Td>
                    <Table.Td>-</Table.Td>
                    <Table.Td ta="right">-</Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
            <hr style={{ margin: '20px 0', border: '1px solid #e0e0e0' }} />
            <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Pagination
                boundaries={3}
                value={page + 1}
                onChange={(v) => {
                  setPage(v - 1)
                }}
                total={Math.ceil(voters.length / pageSize)}
                style={{ marginRight: 8 }}
              />
              <Select
                value={pageSize.toString()}
                onChange={(value) => {
                  setPageSize(Number(value))
                  setPage(0)
                }}
                data={[
                  { value: '10', label: '10 / page' },
                  { value: '20', label: '20 / page' },
                  { value: '50', label: '50 / page' },
                  { value: '100', label: '100 / page' },
                ]}
                style={{ width: 120 }}
              />
            </Box>
          </Flex>
        </Card>
      </Container>
      <Footer />
    </>
  )
}
