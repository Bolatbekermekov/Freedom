import { MouseEvent, memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ICandidate } from '../../../products/models/product.model'

import { CustomTooltip } from '@/core/components/CustomTooltip'
import { TableCell, TableRow } from '@/core/ui/table'

interface ProductsTableItemsProps {
	candidate: ICandidate
}

export const ProductsTableItems = memo(
	({ candidate }: ProductsTableItemsProps) => {
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
					// onClick={() => onDetailsClick(candidate)}
				>
					{/* <TableCell onClick={e => onClickActionCell(e)}>
						<div className='flex items-center gap-5'>
							<button onClick={() => onDetailsClick(candidate)}>
								<GanttChartSquare
									size={18}
									className='text-slate-500'
								/>
							</button>

							<button onClick={() => onUpdateClick(candidate)}>
								<Pencil
									size={18}
									className='text-slate-500'
								/>
							</button>
						</div>
					</TableCell> */}

					<TableCell className='truncate'>{candidate.email}</TableCell>

					<TableCell className='truncate'>{candidate.phone}</TableCell>
					<TableCell className='max-w-72 truncate'>
						{candidate.analysisStatus}
					</TableCell>

					<TableCell className='truncate'>{candidate.analysisResult}</TableCell>


					<TableCell>
						<a
							href={candidate.resumeFilePath}
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-500 hover:underline'
						>
							{t('Скачать резюме')}
						</a>
					</TableCell>
					{/* <TableCell className='truncate'>
						{t(
							candidate.hidden
								? 'PRODUCTS.TABLE.VISIBILITY.HIDDEN'
								: 'PRODUCTS.TABLE.VISIBILITY.VISIBLE'
						)}
					</TableCell> */}
				</TableRow>
			</>
		)
	}
)

ProductsTableItems.displayName = 'ProductsTableItems'
