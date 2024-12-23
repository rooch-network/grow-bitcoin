// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
import { createTheme, MantineProvider, ColorSchemeScript } from '@mantine/core'
import RoochDappProvider from './rooch-dapp-provider'
import '@fontsource/ibm-plex-sans/200.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import '@mantine/core/styles.css'
import './layout.css'
import '@roochnetwork/rooch-sdk-kit/dist/index.css'
import '@radix-ui/themes/styles.css'
import { Theme } from '@radix-ui/themes'
import { ErrorGuard } from './errorGraud'
type Props = {
  children: React.ReactNode
}

const theme = createTheme({
  fontFamily: 'IBM Plex Sans, sans-serif',
  colors: {
    growBTC: [
      '#fff6e1',
      '#ffebcb',
      '#ffd69a',
      '#ffbf64',
      '#ffab37',
      '#ff9f1b',
      '#ff9909',
      '#e38400',
      '#cb7500',
      '#b06400',
    ],
  },
  primaryColor: 'growBTC',
  primaryShade: 6,
  components: {
    Container: {
      defaultProps: {
        style: {
          width: '100%',
        },
      },
    },
  },
})

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Grow Bitcoin</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Theme appearance="light">
            <RoochDappProvider>
              <ErrorGuard />
              {children}
            </RoochDappProvider>
          </Theme>
        </MantineProvider>
      </body>
    </html>
  )
}
