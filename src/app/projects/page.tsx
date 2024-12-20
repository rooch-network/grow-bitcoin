// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
import ClientProjectsPage from './client-page'

import { getAvatar } from '@/utils/x'

export default async function Projects() {
  const projectsResponse = await fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_PROJECT_TABLE_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 60 * 5,
      },
    },
  )

  const projectsRawData = await projectsResponse.json()
  const projects = projectsRawData.records.reduce((a: Project[], c: any) => {
    if (c.fields.Show) {
      try {
        const { fields } = c
        a.push({
          id: c.id,
          slug: fields.Slug,
          name: fields.Name,
          avatar: getAvatar(fields),
          thumbnail: fields.Logo?.[0].thumbnails.large.url,
          oneLiner: fields['One-Liner'],
          tags: fields.Tags || [],
        })
      } catch (e) {
        console.log(e)
      }
    }
    return a
  }, [])

  const tags: string[] = Array.from(new Set<string>(projects.flatMap((i: Project) => i.tags))).sort(
    (a, b) =>
      a.localeCompare(b, 'en', {
        sensitivity: 'base',
        numeric: true,
      }),
  )

  return <ClientProjectsPage projects={projects} tags={tags} />
}
