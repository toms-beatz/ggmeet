import StreamVideoProvider  from '@/providers/StreamClientProvider'
import React, { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "GGMeet",
  description: "Video conference for gamers",
  icons: {
    icon: "/icons/logo.svg",
  }
};

const RootLayout = ({children}: {children: ReactNode}) => {
  return (
    <main>
      <StreamVideoProvider>
        {children}
      </StreamVideoProvider>
    </main>
  )
}

export default RootLayout