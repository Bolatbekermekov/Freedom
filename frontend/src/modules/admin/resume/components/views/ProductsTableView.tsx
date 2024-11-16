'use client'

import dynamic from 'next/dynamic'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ProductsTableItems } from './ProductsTableItems'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'
import { ICandidate } from '@/modules/admin/products/models/product.model'

const UpdateProductDialog = dynamic(
	() =>
		import('../dialogs/UpdateProductDialog').then(m => m.UpdateProductDialog),
	{
		ssr: false
	}
)

const ProductDetailDialog = dynamic(
	() =>
		import('../dialogs/ProductDetailDialog').then(m => m.ProductDetailDialog),
	{
		ssr: false
	}
)

interface ProductsTableView {
	candidates: ICandidate[]
}

export const ProductsTableView = memo(
	({ candidates }: Readonly<ProductsTableView>) => {
		const { t } = useTranslation()

		// const [updateModalOpen, setUpdateModalOpen] = useState(false)
		// const [detailsModalOpen, setDetailsModalOpen] = useState(false)
		// const [selectedProduct, setSelectedProduct] = useState<
		// 	IProducts | undefined
		// >(undefined)

		// const toggleDetailsModal = useCallback(() => {
		// 	setDetailsModalOpen(prev => !prev)
		// }, [])

		// const toggleUpdateModal = useCallback(() => {
		// 	setUpdateModalOpen(prev => !prev)
		// }, [])

		// const onUpdateClick = useCallback(
		// 	(product: IProducts) => {
		// 		setSelectedProduct(product)
		// 		toggleUpdateModal()
		// 	},
		// 	[toggleUpdateModal]
		// )

		// const onDetailsClick = useCallback(
		// 	(product: IProducts) => {
		// 		setSelectedProduct(product)
		// 		toggleDetailsModal()
		// 	},
		// 	[toggleDetailsModal]
		// )

		const renderedList = useMemo(
			() =>
				candidates.map(candidate => (
					<ProductsTableItems
						key={candidate._id}
						candidate={candidate}
					/>
				)),
			[candidates]
		)

		return (
			<div>
				<Table className='w-full rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead className='truncate'>
								{t('Электронная почта')}
							</TableHead>
							<TableHead className='truncate'>
								{t('Телефон')}
							</TableHead>
							<TableHead className='truncate'>
								{t('Статус')}
							</TableHead>
							<TableHead className='truncate'>
								{t('Результат')}
							</TableHead>
							<TableHead className='truncate'>
								{t('Резюме')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>

				{/* {updateModalOpen && selectedProduct && (
					<UpdateProductDialog
						product={selectedProduct}
						isOpen={updateModalOpen}
						toggleOpen={toggleUpdateModal}
					/>
				)}

				{detailsModalOpen && selectedProduct && (
					<ProductDetailDialog
						product={selectedProduct}
						isOpen={detailsModalOpen}
						toggleOpen={toggleDetailsModal}
					/>
				)} */}
			</div>
		)
	}
)

ProductsTableView.displayName = 'ProductsTableView'
