'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function Background() {
  return (
    <div className="fixed inset-0 z-[-1]">
      <Image
        src="/images/background.jpg"
        alt="Dimmed background"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black opacity-85"></div>
    </div>
  );
}
