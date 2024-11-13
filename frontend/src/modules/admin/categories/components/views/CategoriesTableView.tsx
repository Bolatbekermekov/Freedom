'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ICategories } from '../../models/category.model'

import { CategoriesTableItem } from './CategoriesTableItem'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

interface CategoriesTableViewProps {
	categories: ICategories[]
}

export const CategoriesTableView = memo(
	({ categories }: Readonly<CategoriesTableViewProps>) => {
		const { t } = useTranslation()

		const renderedList = useMemo(
			() =>
				categories.map(category => (
					<CategoriesTableItem
						key={category.id}
						category={category}
					/>
				)),
			[categories]
		)

		return (
			<div>
				<Table className='rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead>{t('CATEGORIES.TABLE.NAME')}</TableHead>
							<TableHead className='text-right'></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>
			</div>
		)
	}
)

CategoriesTableView.displayName = 'CategoriesTableView'
