import { NextResponse } from 'next/server'
import { supabase } from '~/lib/supabase/config'

function generateColor(name: string): string {
	const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
	return `#${((hash * 2654435761) & 0xffffff).toString(16).padStart(6, '0')}`
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url)
		const page = Number.parseInt(searchParams.get('page') || '1', 10)
		const pageSize = Number.parseInt(searchParams.get('pageSize') || '20', 10)

		const validPageSize = Math.min(Math.max(pageSize, 1), 100)
		const validPage = Math.max(page, 1)
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
		if (!body.name) {
			return NextResponse.json(
				{ error: 'Tag name is required' },
				{ status: 400 },
			)
		}

		const tagName = body.name.trim()

		if (tagName.length === 0) {
			return NextResponse.json(
				{ error: 'Tag name cannot be empty' },
				{ status: 400 },
			)
		}

		if (tagName.length > 50) {
			return NextResponse.json(
				{ error: 'Tag name must be 50 characters or less' },
				{ status: 400 },
			)
		}

		const color = body.color || generateColor(tagName)

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
