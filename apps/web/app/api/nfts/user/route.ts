import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'
import { getUserStats } from '~/lib/services/user-stats'

/**
 * GET /api/nfts/user
 *
 * Get the current user's NFT record from the database (fast path).
 * Also returns computed stats (impact score, etc.) for tier progress display.
 */
export async function GET() {
  try {
    const session = await getServerSession(nextAuthOption)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { supabase } = await import('@packages/lib/supabase')

    const [nftResult, stats] = await Promise.all([
      supabase
        .from('user_nfts')
        .select('*')
        .eq('user_id', session.user.id)
        .single(),
      getUserStats({ supabase, userId: session.user.id }),
    ])

    const { data: nft, error } = nftResult

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user NFT:', error)
    }

    return NextResponse.json({
      nft: nft || null,
      stats,
    })
  } catch (error) {
    console.error('Error in GET /api/nfts/user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
