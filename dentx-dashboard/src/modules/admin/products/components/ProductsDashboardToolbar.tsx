import dynamic from 'next/dynamic'

import { RefetchOptions } from '@tanstack/react-query'
import { Plus, RefreshCcw, Upload } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useProfile } from '@/core/hooks/useProfile'
import { ROLES } from '@/core/models/user.model'
import { Button } from '@/core/ui/button'

const CreateProductDialog = dynamic(
	() =>
		import('./dialogs/CreateProductDialog').then(m => m.CreateProductDialog),
	{
		ssr: false
	}
)

const UploadProductsDialog = dynamic(
	() =>
		import('./dialogs/upload/UploadProductsDialog').then(
			m => m.UploadProductsDialog
		),
	{
		ssr: false
	}
)

interface ProductsDashboardToolbarProps {
	refetch: (options?: RefetchOptions | undefined) => void
}

export const ProductsDashboardToolbar = memo(
	({ refetch }: ProductsDashboardToolbarProps) => {
		const { data: user } = useProfile()
		const { t } = useTranslation()

		const [createModalOpen, setCreateModalOpen] = useState(false)
		const [uploadModalOpen, setUploadModalOpen] = useState(false)

		const toggleCreateModal = useCallback(() => {
			setCreateModalOpen(prev => !prev)
		}, [])

		const toggleUploadModal = useCallback(() => {
			setUploadModalOpen(prev => !prev)
		}, [])

		const onRefreshClick = useCallback(() => {
			refetch()
		}, [refetch])

		return (
			<div className='flex flex-wrap items-center justify-between gap-2'>
				<h2 className='text-lg font-medium'>{t('PRODUCTS.TITLE')}</h2>

				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						onClick={onRefreshClick}
					>
						<RefreshCcw size={18} />
					</Button>

					{user && user.role === ROLES.SUPERADMIN && (
						<Button
							className='flex gap-2'
							variant='outline'
							onClick={toggleUploadModal}
						>
							<Upload size='18' />
							Загрузить
						</Button>
					)}

					<Button
						className='flex gap-2'
						onClick={toggleCreateModal}
					>
						<Plus size='18' />
						{t('PRODUCTS.CREATE')}
					</Button>

					{createModalOpen && (
						<CreateProductDialog
							isOpen={createModalOpen}
							toggleOpen={toggleCreateModal}
						/>
					)}

					{uploadModalOpen && (
						<UploadProductsDialog
							isOpen={uploadModalOpen}
							toggleOpen={toggleUploadModal}
						/>
					)}
				</div>
			</div>
		)
	}
)

ProductsDashboardToolbar.displayName = 'ProductsDashboardToolbar'
