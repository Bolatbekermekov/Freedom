'use client'

import { memo } from 'react'

import { Pageable } from '../models/paginated.model'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '../ui/pagination'

interface CustomPaginationProps {
	page: number
	prevPage: number | null
	nextPage: number | null
	onPageChange: (pageable: Pageable) => void
	size: number
}

export const CustomPagination = memo(
	({ page, prevPage, nextPage, onPageChange, size }: CustomPaginationProps) => {
		const handlePageChange = (newPage: number) => {
			onPageChange({ page: newPage, size: size })
		}

		return (
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() =>
								handlePageChange(prevPage ? prevPage - 1 : page - 1)
							}
						/>
					</PaginationItem>

					{prevPage && (
						<PaginationItem>
							<PaginationLink onClick={() => handlePageChange(prevPage - 1)}>
								{prevPage}
							</PaginationLink>
						</PaginationItem>
					)}

					<PaginationItem>
						<PaginationLink
							onClick={() => handlePageChange(page - 1)}
							isActive
						>
							{page}
						</PaginationLink>
					</PaginationItem>

					{nextPage && (
						<PaginationItem>
							<PaginationLink onClick={() => handlePageChange(nextPage - 1)}>
								{nextPage}
							</PaginationLink>
						</PaginationItem>
					)}

					<PaginationItem>
						<PaginationEllipsis />
					</PaginationItem>

					<PaginationItem>
						<PaginationNext
							onClick={() =>
								handlePageChange(nextPage ? nextPage - 1 : page - 1)
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		)
	}
)

CustomPagination.displayName = 'CustomPagination'
