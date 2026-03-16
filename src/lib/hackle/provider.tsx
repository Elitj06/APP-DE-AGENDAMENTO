'use client'
import { HackleProvider as BaseHackleProvider, createInstance } from '@hackler/react-sdk'
import { useMemo } from 'react'

const SDK_KEY = process.env.NEXT_PUBLIC_HACKLE_SDK_KEY ?? 'demo'

export function HackleProvider({ children }: { children: React.ReactNode }) {
  const hackleClient = useMemo(() => createInstance(SDK_KEY), [])
  return <BaseHackleProvider hackleClient={hackleClient}>{children}</BaseHackleProvider>
}
