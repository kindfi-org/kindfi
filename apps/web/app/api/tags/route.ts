import { NextResponse } from 'next/server'
import { supabase } from '~/lib/supabase/config'

function generateColor(name: string): string {
	const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
	return `#${((hash * 2654435761) & 0xffffff).toString(16).padStart(6, '0')}`
}

export async function GET() {
	try {
		const { data, error } = await supabase.from('project_tags').select('*')
		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 })
		}
		return NextResponse.json(data)
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

		const color = generateColor(body.name)
		const { data, error } = await supabase
			.from('project_tags')
			.insert({ name: body.name, color })
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
