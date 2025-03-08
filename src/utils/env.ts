// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

export function isMainNetwork() {
  if (typeof window !== 'undefined' && window.location.hostname === 'test-grow.rooch.network') {
    return false
  }else{
    return true
  }
  if (typeof window !== 'undefined') {
    return (
      window.location.hostname === 'grow.rooch.network' ||
      window.location.hostname === 'main-grow.rooch.network'
    )
  }
  return false
}
