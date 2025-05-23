import { Background } from '@/app/components/background'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-white">
      <Background />
      <main className="max-w-2xl mx-auto p-8 rounded-lg flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-6 text-center">SpectraLink - провайдер, якому довіряють</h1>
				<div className="mb-8">
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
				</div>
				<Button asChild className="w-full max-w-xs">
          <a href="/plans">Підключитися</a>
        </Button>
      </main>
    </div>
  )
}