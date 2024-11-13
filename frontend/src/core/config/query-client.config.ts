import { QueryClient, QueryClientConfig } from '@tanstack/react-query'
import { cache } from 'react'

export const queryClientConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: false,
			networkMode: 'always'
		},
		mutations: {
			retry: false,
			networkMode: 'always'
		}
	}
}

export const getQueryClient = cache(() => new QueryClient(queryClientConfig))
