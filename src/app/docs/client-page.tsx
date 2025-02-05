// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { useState } from 'react'
import { Container, Flex, Box, Title } from '@mantine/core'
import DoubleHeader from '@/components/navigation-bar'
import Footer from '@/components/Footer'

import { IconChevronDown } from '@tabler/icons-react'

export default function Docs({ contentHTML, tocHTML }: { contentHTML: string; tocHTML: string }) {
  const [mobileTocExpanded, setMobileTocExpanded] = useState(false)

  return (
    <>
      <DoubleHeader />

      <Container size="lg" py="lg">
        <Flex gap="xl" direction={{ base: 'column', sm: 'row' }}>
          <Box
            flex="none"
            w="16rem"
            pt={{ base: '0', sm: '3.8rem' }}
            component="aside"
            visibleFrom="md"
          >
            <Box style={{ position: 'sticky', top: '1rem' }}>
              <Title order={3} mb="xs">
                Table of Content
              </Title>
              <div
                style={{ marginTop: '1rem' }}
                className="toc"
                dangerouslySetInnerHTML={{ __html: tocHTML }}
              />
            </Box>
          </Box>
          <Box flex={1}>
            <Box bg="white" style={{ position: 'sticky', top: 0 }} hiddenFrom="md" mb="lg" py="md">
              <Flex
                align="center"
                justify="space-between"
                onClick={() => setMobileTocExpanded(!mobileTocExpanded)}
              >
                <Title order={3}>Table of Content</Title>
                <IconChevronDown
                  style={{
                    transform: `rotate(${mobileTocExpanded ? '180deg' : '0deg'})`,
                  }}
                />
              </Flex>
              {mobileTocExpanded && (
                <div
                  style={{ marginTop: '0.5rem' }}
                  className="toc"
                  dangerouslySetInnerHTML={{ __html: tocHTML }}
                />
              )}
            </Box>
            <Box
              id="content"
              component="article"
              dangerouslySetInnerHTML={{ __html: contentHTML }}
            />
          </Box>
        </Flex>
      </Container>

      <Footer />
    </>
  )
}
