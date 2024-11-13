import dynamic from 'next/dynamic'

import { RefetchOptions } from '@tanstack/react-query'
import { Plus, RefreshCcw } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/core/ui/button'

const CreateOrderDialog = dynamic(
	() =>
		import('../dialogs/create-order-dialog/CreateOrderDialog').then(
			m => m.CreateOrderDialog
		),
	{
		ssr: false
	}
)

interface OrdersDashboardToolbarProps {
	refetch: (options?: RefetchOptions | undefined) => void
}

export const OrdersDashboardToolbar = memo(
	({ refetch }: OrdersDashboardToolbarProps) => {
		const { t } = useTranslation()

		const [createModalOpen, setCreateModalOpen] = useState(false)

		const onRefreshClick = useCallback(() => {
			refetch()
		}, [refetch])

		const toggleCreateModal = useCallback(() => {
			setCreateModalOpen(prev => !prev)
		}, [])

		return (
			<div className='flex items-center justify-between'>
				<h2 className='text-lg font-medium'>{t('ORDERS.TITLE')}</h2>

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
						<Download size='16' />
						{t('ORDERS.EXPORT')}
					</Button> */}

					<Button
						className='flex gap-2'
						onClick={toggleCreateModal}
					>
						<Plus size={18} />
						{t('ORDERS.CREATE')}
					</Button>
					{createModalOpen && (
						<CreateOrderDialog
							isOpen={createModalOpen}
							toggleOpen={toggleCreateModal}
						/>
					)}
				</div>
			</div>
		)
	}
)

OrdersDashboardToolbar.displayName = 'OrdersDashboardToolbar'
