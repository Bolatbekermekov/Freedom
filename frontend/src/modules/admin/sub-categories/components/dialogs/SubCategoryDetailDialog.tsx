import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { ISubCategories } from '../../models/sub-category.model'

import { DialogProps } from '@/core/models/dialogs.model'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'

interface SubCategoryDetailDialogProps extends DialogProps {
	subCategory: ISubCategories
}

export const SubCategoryDetailDialog = memo(
	({ subCategory, isOpen, toggleOpen }: SubCategoryDetailDialogProps) => {
		const { t } = useTranslation()

		return (
			<Dialog
				onOpenChange={toggleOpen}
				open={isOpen}
				modal
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-screen overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>
							{t('SUB_CATEGORIES.DIALOGS.DETAILS.HEADER')}
						</DialogTitle>
					</DialogHeader>

					<div className='flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
						<div>
							<p className='text-slate-400'>ID</p>
							<p className='mt-1 font-medium'>{subCategory._id}</p>
						</div>

						<div>
							<p className='text-slate-400'>
								{t('SUB_CATEGORIES.DIALOGS.DETAILS.NAME')}
							</p>
							<p className='mt-1 font-medium'>{subCategory.category}</p>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

SubCategoryDetailDialog.displayName = 'SubCategoryDetailDialog'
