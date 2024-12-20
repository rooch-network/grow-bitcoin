// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
import { RoochClient } from '@roochnetwork/rooch-sdk'
import { AnnotatedMoveStructView } from '@roochnetwork/rooch-sdk/src/client/types/generated'

export type TokenInfo = {
  createBy: string
  data: {
    alive: boolean
    startTime: number
    endTime: number
    timeRemaining: number
    assetTotalValue: number
    assetTotalWeight: number
  }
  coinInfo: {
    type: string
    name: string
    symbol: string
    decimals: number
  }
}

function extractCoinInfoContent(input: string): string | null {
  const regex = /CoinInfo<([^>]+)>/
  const match = input.match(regex)

  if (match && match[1]) {
    return match[1]
  }

  return null
}

export async function getTokenInfo(client: RoochClient, address: string): Promise<TokenInfo> {
  const result = await client.getStates({
    accessPath: `/resource/${address}/${address}::grow_bitcoin::FarmingAsset`,
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  })

  const data = result[0]
  const decode = (((data.decoded_value as any).value as any).value as any).value as any
  const startTime = decode['start_time'] as number
  const endTime = decode['end_time'] as number
  const now = Date.now() / 1000
  const coinInfo = decode['coin_info'] as AnnotatedMoveStructView
  const coinId = coinInfo.value['id'] as string
  const coinType = extractCoinInfoContent(coinInfo.type)!
  const coinDetail = await client.getStates({
    accessPath: `/object/${coinId}`,
    stateOption: {
      decode: true,
      showDisplay: true,
    },
  })
  const coinView = coinDetail[0].decoded_value!.value as any
  return {
    createBy: data.owner,
    data: {
      alive: decode['alive'] as boolean,
      assetTotalValue: decode['asset_total_value'] as number,
      assetTotalWeight: decode['asset_total_weight'] as number,
      startTime,
      endTime,
      timeRemaining: now > endTime ? 0 : Number((endTime - now).toFixed()),
    },
    coinInfo: {
      type: coinType,
      name: coinView.name,
      decimals: coinView.decimals,
      symbol: coinView.symbol,
    },
  }
}
