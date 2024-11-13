import { useRouter } from 'next/navigation'

import { Menu } from 'lucide-react'
import { useCallback, useMemo } from 'react'

import { PRIMARY_PAGES } from '@/core/config/pages-url.config'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger
} from '@/core/ui/dropdown-menu'
import { Skeleton } from '@/core/ui/skeleton'
import { useCategories } from '@/modules/categories/hooks/useCategories'
import { subCategoriesAPIService } from '@/modules/sub-categories/services/subb-categories-api.service'

export const PrimaryCatalogsDropdown = () => {
	const router = useRouter()
	const { data: categories, isPending } = useCategories({
		filter: { includeSubCategory: true }
	})
	const categoriesSkeletons = new Array(12).fill({})

	const onSubCategoryClick = useCallback(
		(subCategoryId: string) => {
			router.push(`${PRIMARY_PAGES.PRODUCTS}/?subCategoryId=${subCategoryId}`)
		},
		[router]
	)

	const renderedCategories = useMemo(() => {
		return categories?.map(async category => {
			const subCategories =
				category.subCategories ??
				(await subCategoriesAPIService.getSubCategories(category.id))

			return (
				<DropdownMenuSub key={category.id}>
					<DropdownMenuSubTrigger>
						<span>{category.section}</span>
					</DropdownMenuSubTrigger>

					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							{subCategories.map(subCategory => (
								<DropdownMenuItem
									key={subCategory._id}
									onClick={() => onSubCategoryClick(subCategory._id)}
								>
									<span>{subCategory.category}</span>
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
			)
		})
	}, [categories, onSubCategoryClick])

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className='flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white'>
					<Menu size={20} />
					<p>Каталог</p>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className='w-56'>
				{categories && renderedCategories}
				{isPending &&
					categoriesSkeletons.map((c, i) => (
						<DropdownMenuItem key={i}>
							<Skeleton className='h-[32px] w-full' />
						</DropdownMenuItem>
					))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
