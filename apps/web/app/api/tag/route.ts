import { NextResponse } from 'next/server'
import { supabase } from '~/lib/supabase/config'

export async function PUT(
  request: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const sanitizedName = body.name.trim();

    if (sanitizedName.length > 50) {
      return NextResponse.json(
        { error: 'Tag name must be 50 characters or less' },
        { status: 400 }
      );
    }

	if (!/^[a-zA-Z0-9\s-_]+$/.test(sanitizedName)) {
      return NextResponse.json(
        { error: 'Tag name contains invalid characters' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('project_tags')
      .update({
        name: sanitizedName,
        updated_at: new Date(),
      })
      .eq('id', params.tagId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
