// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0

import React from 'react'
import { Carousel } from '@mantine/carousel'
import classes from './activity.module.css'
import Link from 'next/link'
import { useCountDown } from 'ahooks'

export const ActivitiesData = [
  {
    name: 'Yescoin',
    title: 'Yescoin Register ends in',
    description:
      'Bringing BTC power to broader SocialFi ecosystem by voting for Yescoin and get Yescoin XP.',
    endTime: 1740124800000,
    icon: './yescoin_logo.svg',
    toReg: true,
  },
  {
    name: 'Pan_Ecosystem',
    title: 'Pan Network Register ends in',
    description:
      'Empowering BTC payment infrastructure by voting for PAN and getting xPAN points. ',
    endTime: 1741248000000,
    icon: './pan_logo.svg',
    titleColor: '#000',
    toReg: true,
  },
  {
    name: 'WORLD3',
    title: 'WORLD3 Register ends in',
    description:
      'Bring the power of BTC to virtual worlds and the AI ecosystem by voting for WORLD3 and earning Lumens.',
    endTime: 1740816000000,
    icon: './group_logo.svg',
    toReg: true,
  },
]

interface ItemProps {
  name: string
  title: string
  description: string
  endTime: number
  icon: string
  toReg: boolean
}

const Item = ({ name, title, description, endTime, icon, toReg }: ItemProps) => {
  const [_countdown, formattedRes] = useCountDown({
    targetDate: endTime,
  })

  const { days, hours, minutes, seconds } = formattedRes

  return (
    <Link href={toReg ? '/register' : `/project/${name}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          paddingLeft: '30px',
          paddingRight: '30px',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div style={{ width: '65%' }}>
          <p
            style={{
              color: '#22AB38',
              fontSize: '1.5rem',
              fontWeight: 500,
            }}
          >
            {title}
          </p>
          <p
            style={{
              color: '#99CD87',
              fontSize: '1rem',
              fontWeight: 600,
              width: '100%',
              wordWrap: 'break-word',
            }}
          >
            {description}
          </p>
        </div>
        <div
          style={{
            width: '35%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 600, marginRight: '4px' }}>
            {days}D {hours}H {minutes}M {seconds}S
          </p>
          <img src={icon} alt="logo" width={56} height={56} />
        </div>
      </div>
    </Link>
  )
}

export const Activities = () => {
  const now = Date.now()
  const slides = ActivitiesData.filter((item) => item.endTime > now).map((item) => (
    <Carousel.Slide key={item.name}>
      <Item
        name={item.name}
        title={item.title}
        description={item.description}
        endTime={item.endTime}
        icon={item.icon}
        toReg={item.toReg}
      />
    </Carousel.Slide>
  ))
  return (
    <div
      style={{
        borderRadius: '12px',
        marginBottom: '16px',
        textAlign: 'left',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src="./banner.svg"
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      />

      {/* Carousel 组件 */}
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
