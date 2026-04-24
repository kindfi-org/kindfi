import { supabase } from '@packages/lib/supabase'
import { NextResponse } from 'next/server'
import {
	createTagSchema,
	paginationQuerySchema,
} from '~/lib/schemas/tag.schemas'
import { validateRequest } from '~/lib/utils/validation'

function generateColor(name: string): string {
	const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
	return `#${((hash * 2654435761) & 0xffffff).toString(16).padStart(6, '0')}`
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const queryData = {
			page: searchParams.get('page'),
			pageSize: searchParams.get('pageSize'),
		}
		const validation = validateRequest(paginationQuerySchema, queryData)
		if (!validation.success) {
			return validation.response
		}
		const validPage = validation.data.page ?? 1
		const validPageSize = validation.data.pageSize ?? 20
		const offset = (validPage - 1) * validPageSize

		const { data, error, count } = await supabase
			.from('project_tags')
			.select('*', { count: 'exact' })
			.range(offset, offset + validPageSize - 1)

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}

		const totalRecords = count ?? 0
		const totalPages = Math.ceil(totalRecords / validPageSize)

		return NextResponse.json({
			data,
			pagination: {
				page: validPage,
				pageSize: validPageSize,
				total: totalRecords,
				totalPages: totalPages,
			},
		})
	} catch (err: unknown) {
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 })
		}
		return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json()
		const validation = validateRequest(createTagSchema, body)
		if (!validation.success) {
			return validation.response
		}
		const { name: tagName, color: colorInput } = validation.data
		const color = colorInput || generateColor(tagName)

		const { data, error } = await supabase
			.from('project_tags')
			.insert({ name: tagName, color })
			.single()

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 409 })
		}

		return NextResponse.json(data, { status: 201 })
	} catch (err: unknown) {
		if (err instanceof Error) {
			return NextResponse.json({ error: err.message }, { status: 500 })
		}
		return NextResponse.json({ error: 'Unknown error' }, { status: 500 })
	}
}
