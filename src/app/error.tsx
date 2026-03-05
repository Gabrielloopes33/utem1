"use client"

import { useEffect } from "react"
import { Button } from "../components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h2 className="text-2xl font-bold">Algo deu errado</h2>
      <p className="text-muted-foreground">
        {error.message || "Ocorreu um erro inesperado"}
      </p>
      <Button onClick={reset}>Tentar novamente</Button>
    </div>
  )
}
