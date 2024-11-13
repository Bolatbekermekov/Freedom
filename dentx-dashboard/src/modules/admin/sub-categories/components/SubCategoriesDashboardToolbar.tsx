import dynamic from 'next/dynamic'

import { RefetchOptions } from '@tanstack/react-query'
import { Plus, RefreshCcw } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/core/ui/button'

const CreateSubCategoryDialog = dynamic(
	() =>
		import('./dialogs/CreateSubCategoryDialog').then(
			m => m.CreateSubCategoryDialog
		),
	{
		ssr: false
	}
)

interface SubCategoriesDashboardToolbarProps {
	refetch: (options?: RefetchOptions | undefined) => void
}

export const SubCategoriesDashboardToolbar = memo(
	({ refetch }: SubCategoriesDashboardToolbarProps) => {
		const { t } = useTranslation()
		const [createModalOpen, setCreateModalOpen] = useState(false)

		const toggleCreateModal = useCallback(() => {
			setCreateModalOpen(prev => !prev)
		}, [])

		const onRefreshClick = () => {
			refetch()
		}

		return (
			<div className='flex flex-wrap items-center justify-between gap-2'>
				<h2 className='text-lg font-medium'>{t('SUB_CATEGORIES.TITLE')}</h2>

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
						{t('SUB_CATEGORIES.EXPORT')}
					</Button> */}

					<Button
						className='flex gap-2'
						onClick={toggleCreateModal}
					>
						<Plus size={18} />
						{t('SUB_CATEGORIES.CREATE')}
					</Button>

					{createModalOpen && (
						<CreateSubCategoryDialog
							isOpen={createModalOpen}
							toggleOpen={toggleCreateModal}
						/>
					)}
				</div>
			</div>
		)
	}
)

SubCategoriesDashboardToolbar.displayName = 'SubCategoriesDashboardToolbar'
