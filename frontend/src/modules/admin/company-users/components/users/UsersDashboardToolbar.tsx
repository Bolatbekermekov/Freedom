import dynamic from 'next/dynamic'

import { RefetchOptions } from '@tanstack/react-query'
import { Plus, RefreshCcw } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/core/ui/button'

const CreateUserDialog = dynamic(
	() => import('./dialogs/CreateUserDialog').then(m => m.CreateUserDialog),
	{
		ssr: false
	}
)

interface UsersDashboardToolbarProps {
	refetch: (options?: RefetchOptions | undefined) => void
}

export const UsersDashboardToolbar = memo(
	({ refetch }: UsersDashboardToolbarProps) => {
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
				<h2 className='text-lg font-medium'>{t('USERS.TITLE')}</h2>
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
						{t('USERS.EXPORT')}
					</Button> */}

					<Button
						onClick={toggleCreateModal}
						className='flex gap-2'
					>
						<Plus size={18} />
						{t('USERS.CREATE')}
					</Button>

					{createModalOpen && (
						<CreateUserDialog
							isOpen={createModalOpen}
							toggleOpen={toggleCreateModal}
						/>
					)}
				</div>
			</div>
		)
	}
)

UsersDashboardToolbar.displayName = 'UsersDashboardToolbar'
