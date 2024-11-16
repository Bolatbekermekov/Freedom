import { Metadata } from 'next'
import { Suspense } from 'react'

import { ResumeListPage } from '../../../../../modules/admin/resume/pages/ResumeListPage'

import { NO_INDEX_PAGE } from '@/core/constants/seo.constant'

export const metadata: Metadata = {
	title: 'Резюме',
	...NO_INDEX_PAGE
}

export default function Page() {
	return (
		<Suspense>
			<ResumeListPage />
		</Suspense>
	)
}
