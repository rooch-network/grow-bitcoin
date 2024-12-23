// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0

declare module '*.svg' {
  const content: any
  export default content
}

interface Project {
  id: string
  slug: string
  name: string
  thumbnail: string
  oneLiner: string
  avatar: string
  tags: string[]
}

interface ProjectDetail extends Project {
  description: string
  website: string
  twitter: string
  github?: string
}

interface FAQ {
  id: string
  icon: string
  questions: string
  answer: string
}

interface ContractProjectTableType {
  tableId: string
  isOpen: boolean
}

interface ContractProjectType {
  id: string
  isOpen: boolean
  vote: number
}

type VoterInfo = {
  address: string
  value: number
}
