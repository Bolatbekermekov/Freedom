'use client'

import dynamic from 'next/dynamic'

import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ProductsTableItems } from './ProductsTableItems'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'
import { IProducts } from '@/modules/admin/products/models/product.model'

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
	products: IProducts[]
}

export const ProductsTableView = memo(
	({ products }: Readonly<ProductsTableView>) => {
		const { t } = useTranslation()

		const [updateModalOpen, setUpdateModalOpen] = useState(false)
		const [detailsModalOpen, setDetailsModalOpen] = useState(false)
		const [selectedProduct, setSelectedProduct] = useState<
			IProducts | undefined
		>(undefined)

		const toggleDetailsModal = useCallback(() => {
			setDetailsModalOpen(prev => !prev)
		}, [])

		const toggleUpdateModal = useCallback(() => {
			setUpdateModalOpen(prev => !prev)
		}, [])

		const onUpdateClick = useCallback(
			(product: IProducts) => {
				setSelectedProduct(product)
				toggleUpdateModal()
			},
			[toggleUpdateModal]
		)

		const onDetailsClick = useCallback(
			(product: IProducts) => {
				setSelectedProduct(product)
				toggleDetailsModal()
			},
			[toggleDetailsModal]
		)

		const renderedList = useMemo(
			() =>
				products.map(product => (
					<ProductsTableItems
						key={product._id}
						product={product}
						onUpdateClick={onUpdateClick}
						onDetailsClick={onDetailsClick}
					/>
				)),
			[onDetailsClick, onUpdateClick, products]
		)

		return (
			<div>
				<Table className='w-full rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead className='truncate'>
								{t('PRODUCTS.TABLE.NAME')}
							</TableHead>
							<TableHead className='truncate'>
								{t('PRODUCTS.TABLE.SUB_CATEGORY')}
							</TableHead>
							<TableHead className='truncate'>
								{t('PRODUCTS.TABLE.PRICE')}
							</TableHead>
							<TableHead className='truncate'>
								{t('PRODUCTS.TABLE.IN_STOCK')}
							</TableHead>
							<TableHead className='truncate'>
								{t('PRODUCTS.TABLE.BARCODE')}
							</TableHead>
							<TableHead className='truncate'>
								{t('PRODUCTS.TABLE.VISIBILITY.LABEL')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>

				{updateModalOpen && selectedProduct && (
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
				)}
			</div>
		)
	}
)

ProductsTableView.displayName = 'ProductsTableView'
