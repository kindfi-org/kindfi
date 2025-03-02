import { NextResponse } from 'next/server'
import { supabase } from '~/lib/supabase/config'

export async function GET(
  _request: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const { data, error } = await supabase
      .from('project_tags')
      .select('*')
      .eq('id', params.tagId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
      }
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

    const { data, error } = await supabase
      .from('project_tags')
      .update({
        name: body.name,
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

export async function DELETE(
  _request: Request,
  { params }: { params: { tagId: string } }
) {
  try {
    const { data, error } = await supabase
      .from('project_tags')
      .delete()
      .eq('id', params.tagId)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data.length) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Tag deleted' }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
