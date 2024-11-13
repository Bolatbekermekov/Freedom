import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { ICategories } from '../../models/category.model'

import { DialogProps } from '@/core/models/dialogs.model'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'

interface CategoryDetailDialogProps extends DialogProps {
	category: ICategories
}

export const CategoryDetailDialog = memo(
	({ category, isOpen, toggleOpen }: CategoryDetailDialogProps) => {
		const { t } = useTranslation()

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='bg-white'>
					<DialogHeader>
						<DialogTitle>{t('CATEGORIES.DIALOGS.DETAILS.HEADER')}</DialogTitle>
					</DialogHeader>
					<div className='flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
						<div>
							<p className='text-slate-400'>#</p>
							<p className='mt-1 font-medium'>{category.id}</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('CATEGORIES.DIALOGS.DETAILS.NAME')}
							</p>
							<p className='mt-1 font-medium'>{category.section}</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

CategoryDetailDialog.displayName = 'CategoryDetailDialog'
