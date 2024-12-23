// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'

import { useSubscribeOnError } from '@roochnetwork/rooch-sdk-kit'

export function ErrorGuard() {
  const subscribeToError = useSubscribeOnError()

  useEffect(() => {
    const unsubscribe = subscribeToError((error) => {
      toast.error(error.message)
    })

    return () => {
      unsubscribe()
    }
  }, [subscribeToError])

  return <></>
}
