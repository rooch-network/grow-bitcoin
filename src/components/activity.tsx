// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Carousel } from '@mantine/carousel'
import classes from './activity.module.css'
import Link from 'next/link'
import { useCountDown } from 'ahooks'

const ActivitiesData = [
  {
    name: 'Yescoin',
    title: 'Yescoin Special Campaign ends in',
    description:
      'Bringing BTC power to broader SocialFi ecosystem by voting for Yescoin and get Yescoin XP.',
    endTime: 1737979200000,
    icon: './yescoin_logo.svg',
  },
  {
    name: 'WORLD3',
    title: 'WORLD3 Special Campaign ends in',
    description:
      'Bring the power of BTC to virtual worlds and the AI ecosystem by voting for WORLD3 and earning Lumens.',
    endTime: 1740038400000,
    icon: './group_logo.svg',
  },
]

interface ItemProps {
  name: string
  title: string
  description: string
  endTime: number
  icon: string
}

const Item = ({ name, title, description, endTime, icon }: ItemProps) => {
  const [_countdown, formattedRes] = useCountDown({
    targetDate: endTime,
  })

  const { days, hours, minutes, seconds } = formattedRes

  return (
    <Link href={`/project/${name}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div style={{ width: '60%' }}>
          <p
            style={{
              color: '#22AB38',
              fontSize: '2rem',
              fontWeight: 600,
            }}
          >
            {name} Special Campaign ends in
          </p>
          <p
            style={{
              color: '#99CD87',
              fontSize: '1rem',
              marginTop: '4px',
              fontWeight: 600,
              width: '100%',
              wordWrap: 'break-word', // 使用 wordWrap 处理长文本换行
            }}
          >
            {description}
          </p>
        </div>
        <div style={{ width: '30%' }}>
          <p style={{ color: '#fff', fontSize: '2.05rem', fontWeight: 600 }}>
            {days}d {hours}h {minutes}m {seconds} s
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={icon} alt="logo" width={80} height={80} />
        </div>
      </div>
    </Link>
  )
}

export const Activities = () => {
  const slides = ActivitiesData.map((item) => (
    <Carousel.Slide key={item.name}>
      <Item
        name={item.name}
        title={item.title}
        description={item.description}
        endTime={item.endTime}
        icon={item.icon}
      />
    </Carousel.Slide>
  ))
  return (
    <div
      style={{
        borderRadius: '12px',
        backgroundImage: 'url(./banner.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        marginBottom: '16px',
        textAlign: 'left',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Carousel
        withIndicators
        loop
        classNames={{
          root: classes.carousel,
          controls: classes.carouselControls,
          indicator: classes.carouselIndicator,
        }}
      >
        {slides}
      </Carousel>
    </div>
  )
}
