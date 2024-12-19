// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Box, Container, Anchor, Flex, Button, UnstyledButton, Stack, Drawer } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import LogoSVG from '@/assets/logo.svg'

import { IconMenu2 } from '@tabler/icons-react'
import { ConnectButton } from '@roochnetwork/rooch-sdk-kit'
import { WalletConnectModal } from './connect-model'
import { useState } from 'react'

function DesktopNavigationBar({ style }: { style?: any }) {
  const pathname = usePathname()

  const [showConnectModel, setShowConnectModel] = useState(false)

  return (
    <Box style={style}>
      <WalletConnectModal isOpen={showConnectModel} onClose={() => setShowConnectModel(false)} />
      <Container size="lg">
        <Flex py="md" align="center" gap="lg">
          <Link href="/">
            <LogoSVG height={56} />
          </Link>
          <Anchor
            component={Link}
            href="/"
            c="dark"
            underline="never"
            fw={pathname === '/' ? '500' : '400'}
          >
            Home
          </Anchor>
          <Anchor
            component={Link}
            href="/stake"
            c="dark"
            underline="never"
            fw={pathname === '/grow' ? '500' : '400'}
          >
            Get $GROW
          </Anchor>
          <Anchor
            component={Link}
            href="/projects"
            c="dark"
            underline="never"
            fw={pathname === '/projects' ? '500' : '400'}
          >
            Projects
          </Anchor>
          <Anchor
            component={Link}
            href="/docs"
            c="dark"
            underline="never"
            fw={pathname === '/docs' ? '500' : '400'}
          >
            Docs
          </Anchor>
          <Anchor
            component={Link}
            href="/portfolio"
            c="dark"
            underline="never"
            fw={pathname === '/portfolio' ? '500' : '400'}
          >
            My Portfolio
          </Anchor>
          <Anchor
            component={Link}
            target="_blank"
            href="https://airtable.com/app442wyztoEmOPul/pagOFIio54GoXGdZf/form"
            c="dark"
            underline="never"
          >
            Submit Project
          </Anchor>
          <ConnectButton />
        </Flex>
      </Container>
    </Box>
  )
}

function MobileNavigationBar({ style }: { style?: any }) {
  const [opened, { open, close }] = useDisclosure(false)
  const pathname = usePathname()

  return (
    <Box style={style}>
      <Container size="lg">
        <Flex py="md" align="center" gap="lg">
          <Link href="/">
            <LogoSVG height={56} />
          </Link>

          <UnstyledButton
            ml="auto"
            onClick={open}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <IconMenu2 />
          </UnstyledButton>
        </Flex>
      </Container>

      <Drawer opened={opened} onClose={close} title="Menu">
        <Stack gap="sm">
          <Button
            component={Link}
            href="/"
            style={{ borderRadius: '0.325rem' }}
            variant={pathname === '/' ? 'filled' : 'outline'}
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/stake"
            style={{ borderRadius: '0.325rem' }}
            variant={pathname === '/stake' ? 'filled' : 'outline'}
          >
            Get $GROW
          </Button>
          <Button
            component={Link}
            href="/projects"
            style={{ borderRadius: '0.325rem' }}
            variant={pathname === '/projects' ? 'filled' : 'outline'}
          >
            Projects
          </Button>
          <Button
            component={Link}
            href="/docs"
            style={{ borderRadius: '0.325rem' }}
            variant={pathname === '/docs' ? 'filled' : 'outline'}
          >
            Docs
          </Button>
          <Button
            component={Link}
            href="/portfolio"
            style={{ borderRadius: '0.325rem' }}
            variant={pathname === '/portfolio' ? 'filled' : 'outline'}
          >
            My Portfolio
          </Button>
        </Stack>
      </Drawer>
    </Box>
  )
}

export default function NavigationBar({ style }: { style?: any }) {
  const mobileMatches = useMediaQuery('(max-width: 48em)')

  if (mobileMatches) {
    return <MobileNavigationBar style={style} />
  }

  return <DesktopNavigationBar style={style} />
}
