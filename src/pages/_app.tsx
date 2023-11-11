import '@/styles/globals.css'
import '@/styles/nes.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoadingBackdrop from '@/components/LoadingBackdrop'

const queryClient = new QueryClient()
export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <LoadingBackdrop />
    </QueryClientProvider>
  )
}
