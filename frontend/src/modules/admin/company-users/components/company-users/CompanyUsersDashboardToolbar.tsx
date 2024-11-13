import dynamic from 'next/dynamic'

import { RefetchOptions } from '@tanstack/react-query'
import { Plus, RefreshCcw } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/core/ui/button'

const AddCompanyUserDialog = dynamic(
	() =>
		import('./dialogs/AddCompanyUserDialog').then(m => m.AddCompanyUserDialog),
	{
		ssr: false
	}
)

interface CompanyUsersDashboardToolbarProps {
	refetch: (options?: RefetchOptions | undefined) => void
}

export const CompanyUsersDashboardToolbar = memo(
	({ refetch }: CompanyUsersDashboardToolbarProps) => {
		const { t } = useTranslation()

		const [createModalOpen, setCreateModalOpen] = useState(false)

		const toggleCreateModal = useCallback(() => {
			setCreateModalOpen(prev => !prev)
		}, [])

		const onRefreshClick = useCallback(() => {
			refetch()
		}, [refetch])

		return (
			<div className='flex flex-wrap items-center justify-between gap-2'>
				<h2 className='text-lg font-medium'>{t('COMPANY_USERS.TITLE')}</h2>
				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						onClick={onRefreshClick}
					>
						<RefreshCcw size={18} />
					</Button>

					{/* <Button
						variant='outline'
						className='flex gap-2'
					>
						<Download size={16} />
						{t('COMPANY_USERS.EXPORT')}
					</Button> */}

					<Button
						onClick={toggleCreateModal}
						className='flex gap-2'
					>
						<Plus size={18} />
						{t('COMPANY_USERS.CREATE')}
					</Button>

					{createModalOpen && (
						<AddCompanyUserDialog
							isOpen={createModalOpen}
							toggleOpen={toggleCreateModal}
						/>
					)}
				</div>
			</div>
		)
	}
)

CompanyUsersDashboardToolbar.displayName = 'CompanyUsersDashboardToolbar'
