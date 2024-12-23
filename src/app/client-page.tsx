// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useMantineTheme,
} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import NavigationBar from '@/components/NavigationBar'
import Footer from '@/components/Footer'

import { IconQuestionMark, IconChevronCompactRight } from '@tabler/icons-react'
import Step1SVG from '@/assets/step-1.svg'
import Step2SVG from '@/assets/step-2.svg'
import Step3SVG from '@/assets/step-3.svg'
import Step4SVG from '@/assets/step-4.svg'

const IconWall = ({ size = 56 }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  const gap = size / 1.5
  const iconWithMargin = size + gap
  const diagonalDistance = (Math.sqrt(2) * iconWithMargin) / 2

  const createIcon = (row: number, col: number) => {
    const x = col * diagonalDistance
    const y = row * diagonalDistance
    return (
      <g
        key={`${row}-${col}`}
        transform={`translate(${x}, ${y}) rotate(-45, ${size / 2}, ${size / 2})`}
      >
        <svg width={size} height={size} viewBox="0 0 4091.27 4091.73">
          <path
            fill="#F7931A"
            d="M4030.06 2540.77C3756.82 3636.78 2646.74 4303.79 1550.6 4030.48 454.92 3757.24-212.09 2647.09 61.27 1551.17c273.12-1096.13 1383.2-1763.19 2479-1489.95C3636.33 334.46 4303.3 1444.73 4030.03 2540.79l.02-.02z"
          />
          <path
            fill="#fff"
            d="M2947.77 1754.38c40.72-272.26-166.56-418.61-450-516.24l91.95-368.8-224.5-55.94-89.51 359.09c-59.02-14.72-119.63-28.59-179.87-42.34L2186 768.69l-224.36-55.94-92 368.68c-48.84-11.12-96.81-22.11-143.35-33.69l.26-1.16-309.59-77.31-59.72 239.78s166.56 38.18 163.05 40.53c90.91 22.69 107.35 82.87 104.62 130.57l-104.74 420.15c6.26 1.59 14.38 3.89 23.34 7.49-7.49-1.86-15.46-3.89-23.73-5.87l-146.81 588.57c-11.11 27.62-39.31 69.07-102.87 53.33 2.25 3.26-163.17-40.72-163.17-40.72l-111.46 256.98 292.15 72.83c54.35 13.63 107.61 27.89 160.06 41.3l-92.9 373.03 224.24 55.94 92-369.07c61.26 16.63 120.71 31.97 178.91 46.43l-91.69 367.33 224.51 55.94 92.89-372.33c382.82 72.45 670.67 43.24 791.83-303.02 97.63-278.78-4.86-439.58-206.26-544.44 146.69-33.83 257.18-130.31 286.64-329.61l-.07-.05zm-512.93 719.26c-69.38 278.78-538.76 128.08-690.94 90.29l123.28-494.2c152.17 37.99 640.17 113.17 567.67 403.91zm69.43-723.3c-63.29 253.58-453.96 124.75-580.69 93.16l111.77-448.21c126.73 31.59 534.85 90.55 468.94 355.05h-.02z"
          />
        </svg>
      </g>
    )
  }

  const patternWidth = diagonalDistance * 4
  const patternHeight = diagonalDistance * 4

  const icons = [
    createIcon(0, 0),
    createIcon(0, 2),
    createIcon(1, 1),
    createIcon(1, 3),
    createIcon(2, 0),
    createIcon(2, 2),
    createIcon(3, 1),
    createIcon(3, 3),
  ]

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        zIndex: 1,
        inset: 0,
        opacity: 0.04,
        pointerEvents: 'none',
      }}
    >
      <svg width={dimensions.width} height={dimensions.height} style={{ overflow: 'hidden' }}>
        <defs>
          <pattern
            id="iconPattern"
            x="0"
            y="0"
            width={patternWidth}
            height={patternHeight}
            patternUnits="userSpaceOnUse"
          >
            {icons}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#iconPattern)" />
      </svg>
    </div>
  )
}

export default function Home({ faq }: { faq: FAQ[] }) {
  const theme = useMantineTheme()
  const desktopMatches = useMediaQuery('(min-width: 48em)')
  const mobileMatches = useMediaQuery('(min-width: 28em)')

  return (
    <>
      <Box component="header" py={{ base: '12rem', md: '16rem' }} style={{ position: 'relative' }}>
        <NavigationBar style={{ position: 'absolute', zIndex: 9, top: 0, left: 0, right: 0 }} />

        <IconWall />
        <Container size="lg" style={{ position: 'relative', zIndex: 2 }}>
          <Stack align="center" gap="0">
            <Title order={1} fz={{ base: '2.5rem', sm: '3.5rem', md: '5rem' }} fw="200" ta="center">
              Grow Bitcoin
            </Title>
            <Text size="lg" c="gray.7" ta="center">
              Backing Ideas with Bitcoin Staking
            </Text>
            <Group mt="lg" justify="center">
              <Button
                component={Link}
                href="/stake"
                radius="md"
                variant="outline"
                size="md"
                fullWidth={!mobileMatches}
              >
                Earn $GROW
              </Button>
              <Button
                component={Link}
                href="/projects"
                radius="md"
                size="md"
                fullWidth={!mobileMatches}
              >
                Vote for Ideas
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      <Box component="section" py="4rem" bg="gray.0">
        <Container size="lg">
          <Flex
            gap={{ base: '3rem', xs: '2.5rem 4%', sm: 'md' }}
            align="flex-top"
            wrap={{ base: 'wrap', sm: 'nowrap' }}
          >
            <Stack gap="0" ta="center" align="center" w={{ base: '100%', xs: '48%', sm: 'auto' }}>
              <ThemeIcon size="5rem" radius="50%">
                <Step1SVG width={30} />
              </ThemeIcon>
              <Title order={3} size="1.25rem" fw="500" mt="12" mb="4">
                Stake
              </Title>
              <Text size="md" c="gray.7">
                Stake Bitcoin via Babylon, LRT or Self-Staking
              </Text>
            </Stack>
            <IconChevronCompactRight
              size="5rem"
              style={{
                alignSelf: 'center',
                display: desktopMatches ? 'block' : 'none',
              }}
              color={theme.colors.gray[2]}
            />
            <Stack gap="0" ta="center" align="center" w={{ base: '100%', xs: '48%', sm: 'auto' }}>
              <ThemeIcon size="5rem" radius="50%">
                <Step2SVG width={40} />
              </ThemeIcon>
              <Title order={3} size="1.25rem" fw="500" mt="12" mb="4">
                Claim
              </Title>
              <Text size="md" c="gray.7">
                Claim your $GROW token with your staking
              </Text>
            </Stack>
            <IconChevronCompactRight
              size="5rem"
              style={{
                alignSelf: 'center',
                display: desktopMatches ? 'block' : 'none',
              }}
              color={theme.colors.gray[2]}
            />
            <Stack gap="0" ta="center" align="center" w={{ base: '100%', xs: '48%', sm: 'auto' }}>
              <ThemeIcon size="5rem" radius="50%">
                <Step3SVG width={36} />
              </ThemeIcon>
              <Title order={3} size="1.25rem" fw="500" mt="12" mb="4">
                Vote
              </Title>
              <Text size="md" c="gray.7">
                Vote for Ideas with your $GROW token
              </Text>
            </Stack>
            <IconChevronCompactRight
              size="5rem"
              style={{
                alignSelf: 'center',
                display: desktopMatches ? 'block' : 'none',
              }}
              color={theme.colors.gray[2]}
            />
            <Stack gap="0" ta="center" align="center" w={{ base: '100%', xs: '48%', sm: 'auto' }}>
              <ThemeIcon size="5rem" radius="50%">
                <Step4SVG width={44} />
              </ThemeIcon>
              <Title order={3} size="1.25rem" fw="500" mt="12" mb="4">
                Earn
              </Title>
              <Text size="md" c="gray.7">
                Earn tokens as ideas grow into projects.
              </Text>
            </Stack>
          </Flex>
        </Container>
      </Box>

      <Box component="section" py="4rem">
        <Container size="lg">
          <Stack gap="0">
            <Title order={2} size="2.75rem">
              FAQs
            </Title>
            <Text c="gray.7">What, Why, and How</Text>
          </Stack>

          <Grid gutter="2.5rem" mt="3rem">
            {faq.map((i) => (
              <Grid.Col key={i.questions} span={{ base: 12, xs: 6, md: 4 }}>
                <ThemeIcon size="xl" radius="md">
                  <IconQuestionMark />
                </ThemeIcon>
                <Title order={4} fw="500" mt="10" mb="4">
                  {i.questions}
                </Title>
                <Text
                  size="md"
                  c="gray.7"
                  dangerouslySetInnerHTML={{ __html: i.answer.replace(/\n/g, '<br />') }}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      <Footer />
    </>
  )
}
