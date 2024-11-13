import dynamic from 'next/dynamic'

import { RefetchOptions } from '@tanstack/react-query'
import { Plus, RefreshCcw } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/core/ui/button'

const CreateCategoryDialog = dynamic(
	() =>
		import('./dialogs/CreateCategoryDialog').then(m => m.CreateCategoryDialog),
	{ ssr: false }
)

interface CategoriesDashboardToolbarProps {
	refetch: (options?: RefetchOptions | undefined) => void
}

export const CategoriesDashboardToolbar = memo(
	({ refetch }: CategoriesDashboardToolbarProps) => {
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
				<h2 className='text-lg font-medium'>{t('CATEGORIES.TITLE')}</h2>

				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						onClick={onRefreshClick}
					>
						<RefreshCcw size={18} />
					</Button>

					<Button
						onClick={toggleCreateModal}
						className='flex gap-2'
					>
						<Plus size={18} />
						{t('CATEGORIES.CREATE')}
					</Button>

					{createModalOpen && (
						<CreateCategoryDialog
							isOpen={createModalOpen}
							toggleOpen={toggleCreateModal}
						/>
					)}
				</div>
			</div>
		)
	}
)

CategoriesDashboardToolbar.displayName = 'CategoriesDashboardToolbar'
