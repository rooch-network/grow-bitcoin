// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Group,
  Image,
  Input,
  Text,
  Title,
} from '@mantine/core'
import Link from 'next/link'
import NavigationBar from '@/components/NavigationBar'
import Footer from '@/components/Footer'

import { IconChevronLeft, IconThumbUp, IconExternalLink } from '@tabler/icons-react'
import {
  useCurrentAddress,
  useCurrentSession,
  useRoochClient,
  useRoochClientQuery,
} from '@roochnetwork/rooch-sdk-kit'
import { Args, Transaction } from '@roochnetwork/rooch-sdk'
import { AnnotatedMoveStructView } from '@roochnetwork/rooch-sdk/src/client/types/generated'
import { useEffect, useState } from 'react'
import { getTokenInfo } from '@/app/stake/util'
import { useNetworkVariable } from '@/app/networks'
import { WalletConnectModal } from '@/components/connect-model'
import { CreateSessionModal } from '@/components/session-model'
import { formatBalance } from '@/utils/balance'
import Markdown from 'react-markdown'
import toast from 'react-hot-toast'

export default function ProjectDetail({ project }: { project: ProjectDetail }) {
  const [showConnectModel, setShowConnectModel] = useState(false)
  const [showCreateSessionModel, setShowCreateSessionModel] = useState(false)
  const session = useCurrentSession()
  const contractAddr = useNetworkVariable('contractAddr')
  const contractVersion = useNetworkVariable('contractVersion')
  const [balance, setBalance] = useState(-1)
  const [amount, setAmount] = useState('')
  const client = useRoochClient()
  const addr = useCurrentAddress()
  const moduleName = `${contractAddr}::grow_information_${contractVersion}`
  const [loading, setLoading] = useState(false)
  const projectListObj = Args.object({
    address: contractAddr,
    module: `grow_information_${contractVersion}`,
    name: 'GrowProjectList',
  })
  const { data, refetch } = useRoochClientQuery('executeViewFunction', {
    target: `${moduleName}::borrow_grow_project`,
    args: [projectListObj, Args.string(project.slug)],
  })

  useEffect(() => {
    if (!addr) {
      return
    }
    if (!data || data.vm_status !== 'Executed') {
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
  }, [data, client, contractAddr, addr])

  const handleVote = async () => {
    if (addr === null) {
      setShowConnectModel(true)
      return
    }
    if (session === null) {
      setShowCreateSessionModel(true)
      return
    }
    setLoading(true)
    const tx = new Transaction()
    tx.callFunction({
      target: `${moduleName}::vote_entry`,
      args: [projectListObj, Args.string(project.slug), Args.u256(BigInt(amount))],
    })
    try {
      const reuslt = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: session,
      })

      if (reuslt.execution_info.status.type === 'executed') {
        toast.success('vote success')
        await refetch()
      }
    } catch (e: any) {
      if (e.code === 1002) {
        setShowCreateSessionModel(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <NavigationBar />
      <WalletConnectModal isOpen={showConnectModel} onClose={() => setShowConnectModel(false)} />
      <CreateSessionModal
        isOpen={showCreateSessionModel}
        onClose={() => setShowCreateSessionModel(false)}
      />
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
            <Title order={3}>About the Project</Title>
            <Markdown>{project.description}</Markdown>
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
                <Button
                  variant="outline"
                  leftSection={<IconThumbUp size="1.5em" />}
                  radius="xl"
                  disabled={true}
                >
                  {
                    (data!.return_values![0].decoded_value as AnnotatedMoveStructView).value[
                      'vote_value'
                    ] as string
                  }
                </Button>
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
                  <Button
                    radius="md"
                    disabled={!addr || balance === 0}
                    loading={loading}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onClick={handleVote}
                  >
                    Vote
                  </Button>
                </Group>
              </Flex>
              <Flex ta="right" gap="xs" justify="flex-end" mt="6" c="gray.7">
                {addr ? (
                  <>
                    <Text size="sm">{`Your $GROW Balance: ${balance === -1 ? '-' : formatBalance(balance)}`}</Text>
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

          {/*<Card bg="gray.0" radius="lg" mt="xl" p="lg">*/}
          {/*  <Title order={4}>Your Votes</Title>*/}
          {/*  <Text mt="4">*/}
          {/*    You have voted 4 times for the project and earned 4 BitXP as well*/}
          {/*    as 4 Project Alpha XP.*/}
          {/*  </Text>*/}
          {/*</Card>*/}
        </Card>
      </Container>

      <Footer />
    </>
  )
}
