import { createSupabaseServerClient } from '@packages/lib/supabase-server'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

// POST /api/comments/[id]/like
export async function POST(
        req: Request,
        { params }: { params: { id: string } },
) {
        try {
                const supabase = await createSupabaseServerClient()

                const { data: authData } = await supabase.auth.getUser()
                if (!authData?.user) {
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
                }

                const id = params.id
                if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

                const { data: existing, error: fetchError } = await supabase
                        .from('comments')
                        .select('id, metadata')
                        .eq('id', id)
                        .single()

                if (fetchError || !existing) return NextResponse.json({ error: 'Comment not found' }, { status: 404 })

                const metadata = (existing.metadata as Record<string, any>) || {}
                const likedBy: string[] = Array.isArray(metadata.liked_by) ? metadata.liked_by : []

                const userId = authData.user.id
                const hasLiked = likedBy.includes(userId)
                let newLikedBy: string[]
                if (hasLiked) {
                        newLikedBy = likedBy.filter((id) => id !== userId)
                } else {
                        newLikedBy = [...likedBy, userId]
                }

                const newMetadata = {
                        ...metadata,
                        liked_by: newLikedBy,
                        likes: newLikedBy.length,
                }

                const { data, error } = await supabase
                        .from('comments')
                        .update({ metadata: newMetadata })
                        .eq('id', id)
                        .select('id, metadata')
                        .single()

                if (error) {
                        logger.error('Failed to update likes:', error)
                        return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
                }

                return NextResponse.json({ success: true, data })
        } catch (error) {
                logger.error('Error in like route:', error)
                return NextResponse.json({ error: 'Internal error' }, { status: 500 })
        }
}
