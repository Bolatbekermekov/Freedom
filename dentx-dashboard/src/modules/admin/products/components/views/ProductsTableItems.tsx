import { GanttChartSquare, Pencil } from 'lucide-react'
import { MouseEvent, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { IProducts } from '../../models/product.model'

import { CustomTooltip } from '@/core/components/CustomTooltip'
import { TableCell, TableRow } from '@/core/ui/table'

interface ProductsTableItemsProps {
	product: IProducts
	onUpdateClick: (product: IProducts) => void
	onDetailsClick: (product: IProducts) => void
}

export const ProductsTableItems = memo(
	({ product, onUpdateClick, onDetailsClick }: ProductsTableItemsProps) => {
		const { t } = useTranslation()

		const onClickActionCell = useCallback(
			(event: MouseEvent<HTMLTableCellElement>) => {
				event.stopPropagation()
			},
			[]
		)

		return (
			<>
				<TableRow
					className='cursor-pointer hover:bg-slate-100'
					onClick={() => onDetailsClick(product)}
				>
					<TableCell onClick={e => onClickActionCell(e)}>
						<div className='flex items-center gap-5'>
							<button onClick={() => onDetailsClick(product)}>
								<GanttChartSquare
									size={18}
									className='text-slate-500'
								/>
							</button>

							<button onClick={() => onUpdateClick(product)}>
								<Pencil
									size={18}
									className='text-slate-500'
								/>
							</button>
						</div>
					</TableCell>
					<TableCell>
						<CustomTooltip tooltip={product.name}>
							<p className='max-w-72 truncate'>{product.name}</p>
						</CustomTooltip>
					</TableCell>
					<TableCell className='truncate'>
						{product.category.category}
					</TableCell>
					<TableCell className='truncate'>
						{product.price.toLocaleString()}
					</TableCell>
					<TableCell className='truncate'>{product.stock}</TableCell>
					<TableCell className='max-w-72 truncate'>
						{product.productCode}
					</TableCell>
					<TableCell className='truncate'>
						{t(
							product.hidden
								? 'PRODUCTS.TABLE.VISIBILITY.HIDDEN'
								: 'PRODUCTS.TABLE.VISIBILITY.VISIBLE'
						)}
					</TableCell>
				</TableRow>
			</>
		)
	}
)

ProductsTableItems.displayName = 'ProductsTableItems'
