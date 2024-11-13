'use client'

import dynamic from 'next/dynamic'

import { GanttChartSquare, Pencil } from 'lucide-react'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ISubCategories } from '../../models/sub-category.model'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

const UpdateSubCategoryDialog = dynamic(
	() =>
		import('../dialogs/UpdateSubCategoryDialog').then(
			m => m.UpdateSubCategoryDialog
		),
	{
		ssr: false
	}
)

const SubCategoryDetailDialog = dynamic(
	() =>
		import('../dialogs/SubCategoryDetailDialog').then(
			m => m.SubCategoryDetailDialog
		),
	{
		ssr: false
	}
)

interface SubCategoriesTableViewProps {
	subCategories: ISubCategories[]
}

export const SubCategoriesTableView = memo(
	({ subCategories }: Readonly<SubCategoriesTableViewProps>) => {
		const { t } = useTranslation()

		const [detailsModalOpen, setDetailsModalOpen] = useState(false)
		const [updateModalOpen, setUpdateModalOpen] = useState(false)

		const toggleDetailsModal = useCallback(() => {
			setDetailsModalOpen(prev => !prev)
		}, [])

		const toggleUpdateModal = useCallback(() => {
			setUpdateModalOpen(prev => !prev)
		}, [])

		const renderedList = useMemo(
			() =>
				subCategories.map(subCategory => (
					<TableRow key={subCategory._id}>
						<TableCell>{subCategory.category}</TableCell>
						<TableCell className='text-right'>
							<div className='flex items-center justify-end gap-4'>
								<button onClick={toggleDetailsModal}>
									<GanttChartSquare size={18} />
								</button>
								<button onClick={toggleUpdateModal}>
									<Pencil size={18} />
								</button>

								{detailsModalOpen && (
									<SubCategoryDetailDialog
										subCategory={subCategory}
										isOpen={detailsModalOpen}
										toggleOpen={toggleDetailsModal}
									/>
								)}

								{updateModalOpen && (
									<UpdateSubCategoryDialog
										subCategory={subCategory}
										isOpen={updateModalOpen}
										toggleOpen={toggleUpdateModal}
									/>
								)}
							</div>
						</TableCell>
					</TableRow>
				)),
			[
				detailsModalOpen,
				subCategories,
				toggleDetailsModal,
				toggleUpdateModal,
				updateModalOpen
			]
		)

		return (
			<div>
				<Table className='rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead>{t('SUB_CATEGORIES.TABLE.NAME')}</TableHead>
							<TableHead className='text-right'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>
			</div>
		)
	}
)

SubCategoriesTableView.displayName = 'SubCategoriesTableView'
