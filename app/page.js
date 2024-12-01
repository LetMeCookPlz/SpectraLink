import { Background } from '@/app/components/background'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <Background />
      <main className="max-w-2xl mx-auto p-8 rounded-lg">
        <h1 className="text-4xl font-bold mb-6">SpectraLink - Ukraine's №1 trusted Internet Provider</h1>
        <p className="mb-4 text-xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc id
          aliquam tincidunt, nisl nunc tincidunt urna, id lacinia nunc nunc id lectus.
        </p>
        <p className="mb-4 text-xl">
          Sed euismod, nunc id aliquam tincidunt, nisl nunc tincidunt urna, id lacinia
          nunc nunc id lectus. Nullam auctor, nunc id aliquam tincidunt, nisl nunc
          tincidunt urna, id lacinia nunc nunc id lectus.
        </p>
        <p className="text-xl">
          Donec euismod, nunc id aliquam tincidunt, nisl nunc tincidunt urna, id lacinia
          nunc nunc id lectus. Nullam auctor, nunc id aliquam tincidunt, nisl nunc
          tincidunt urna, id lacinia nunc nunc id lectus.
        </p>
      </main>
    </div>
  )
}