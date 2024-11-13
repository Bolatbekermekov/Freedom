import dynamic from 'next/dynamic'

import { GanttChartSquare, Pencil } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { ICategories } from '../../models/category.model'

import { TableCell, TableRow } from '@/core/ui/table'

const CategoryDetailDialog = dynamic(
	() =>
		import('../dialogs/CategoryDetailDialog').then(m => m.CategoryDetailDialog),
	{ ssr: false }
)
const UpdateCategoryDialog = dynamic(
	() =>
		import('../dialogs/UpdateCategoryDialog').then(m => m.UpdateCategoryDialog),
	{ ssr: false }
)

interface CategoriesTableItemProps {
	category: ICategories
}

export const CategoriesTableItem = memo(
	({ category }: CategoriesTableItemProps) => {
		const [detailsModalOpen, setDetailsModalOpen] = useState(false)
		const [updateModalOpen, setUpdateModalOpen] = useState(false)

		const toggleDetailsModal = useCallback(() => {
			setDetailsModalOpen(prev => !prev)
		}, [])

		const toggleUpdateModal = useCallback(() => {
			setUpdateModalOpen(prev => !prev)
		}, [])

		return (
			<TableRow key={category.id}>
				<TableCell>{category.section}</TableCell>
				<TableCell className='text-right'>
					<div className='flex items-center justify-end gap-4'>
						<button onClick={toggleDetailsModal}>
							<GanttChartSquare size={18} />
						</button>

						<button onClick={toggleUpdateModal}>
							<Pencil size={18} />
						</button>

						{detailsModalOpen && (
							<CategoryDetailDialog
								category={category}
								isOpen={detailsModalOpen}
								toggleOpen={toggleDetailsModal}
							/>
						)}

						{updateModalOpen && (
							<UpdateCategoryDialog
								category={category}
								isOpen={updateModalOpen}
								toggleOpen={toggleUpdateModal}
							/>
						)}
					</div>
				</TableCell>
			</TableRow>
		)
	}
)

CategoriesTableItem.displayName = 'CategoriesTableItem'
