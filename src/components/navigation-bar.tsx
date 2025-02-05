// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
import { Anchor, Box, Burger, Container, Group } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import classes from './navigation-bar.module.css'
import LogoSVG from '@/assets/logo.svg'
import Link from 'next/link'
import { ConnectButton } from '@roochnetwork/rooch-sdk-kit'
import { useRouter } from 'next/navigation'
import { useNavigationProvider } from './navigation-porvider'
const userLinks = [
  { link: 'https://rooch.network/', label: 'Rooch' },
  { link: 'https://portal.rooch.network/', label: 'Portal' },
  { link: 'https://portal.rooch.network/trade/swap', label: 'Swap $Grow' }, // TODO: add default token pair
  {
    link: 'https://airtable.com/app442wyztoEmOPul/pagOFIio54GoXGdZf/form',
    label: 'Submit Project',
  },
]

const mainLinks = [
  { link: '/', label: 'Home' },
  { link: '/stake', label: 'Earn $GROW' },
  { link: '/projects', label: 'Projects' },
  { link: '/docs', label: 'Docs' },
  { link: '/portfolio', label: 'My Portfolio' },
]

export default function DoubleHeader({ style }: { style?: any }) {
  const [opened, { toggle }] = useDisclosure(false)
  const { active, setActive } = useNavigationProvider()
  const router = useRouter()

  const mainItems = mainLinks.map((item, index) => (
    <Anchor<'a'>
      href={item.link}
      key={item.label}
      className={classes.mainLink}
      data-active={index === active || undefined}
      onClick={(event) => {
        router.push(item.link)
        event.preventDefault()
        setActive(index)
      }}
    >
      {item.label}
    </Anchor>
  ))

  const secondaryItems = userLinks.map((item) => (
    <Anchor href={item.link} key={item.label} target="_blank" className={classes.secondaryLink}>
      {item.label}
    </Anchor>
  ))

  return (
    <Container style={style} size="lg" className={classes.inner}>
      <Link href="/">
        <LogoSVG height={56} />
      </Link>
      <Group>
        <Box className={classes.links} visibleFrom="sm">
          <Group justify="flex-end">{secondaryItems}</Group>
          <Group gap={0} justify="flex-end" className={classes.mainLinks}>
            {mainItems}
          </Group>
        </Box>
        <Burger
          opened={opened}
          onClick={toggle}
          className={classes.burger}
          size="sm"
          hiddenFrom="sm"
        />
        <ConnectButton />
      </Group>
    </Container>
  )
}
