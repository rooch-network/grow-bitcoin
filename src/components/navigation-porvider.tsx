// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
'use client'
import React, { ReactNode, createContext, useContext, useState } from 'react'

export interface NavigationProviderContext {
  active: number
  setActive: (value: number) => void
}

const NavigationContext = createContext<NavigationProviderContext | null>(null)

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(0)

  return (
    <NavigationContext.Provider value={{ active, setActive }}>
      {children}
    </NavigationContext.Provider>
  )
}

export const useNavigationProvider = () => {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useActive must be used within an ActiveProvider')
  }
  return context
}
