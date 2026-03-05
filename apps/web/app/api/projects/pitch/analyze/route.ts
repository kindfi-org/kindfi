import { gateway, streamText } from 'ai'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nextAuthOption } from '~/lib/auth/auth-options'

export const maxDuration = 30

const SYSTEM_PROMPT = `You are an expert project pitch consultant specializing in impact-driven and crowdfunding projects. 
Your role is to analyze project pitches and provide actionable, constructive feedback to help creators improve their pitches.

When analyzing a pitch, evaluate these key areas:
1. **Clarity & Compelling Hook** - Is the problem statement clear and engaging?
2. **Solution Strength** - Is the proposed solution unique and well-defined?
3. **Impact & Mission** - Is the social/environmental impact clearly articulated?
4. **Call to Action** - Does it inspire supporters to contribute?
5. **Storytelling** - Is the narrative engaging and emotionally resonant?
6. **Completeness** - Are all essential pitch elements present?

Provide your response in this structured format:

## Overall Assessment
A brief 2-3 sentence summary of the pitch's overall quality and potential.

## Strengths
- List 2-4 specific strengths with brief explanations

## Areas for Improvement
- List 2-4 specific, actionable improvements with concrete suggestions

## Recommended Enhancements
Provide 2-3 specific, rewritten examples or additions that would strengthen the pitch. Be concrete and show, don't just tell.

## Score
Rate each dimension on a scale of 1-10:
- Clarity: X/10
- Impact: X/10  
- Storytelling: X/10
- Call to Action: X/10

Keep your feedback encouraging, specific, and actionable. Focus on helping creators improve their pitch to attract supporters.`

export async function POST(req: Request) {
	try {
		const session = await getServerSession(nextAuthOption)
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const { title, story } = await req.json()

		if (!title?.trim() || !story?.trim()) {
			return NextResponse.json(
				{ error: 'Title and story are required for analysis' },
				{ status: 400 },
			)
		}

		const userMessage = `Please analyze this project pitch and provide detailed feedback:

**Title:** ${title}

**Story/Description:**
${story}

Provide specific, actionable recommendations to help improve this pitch for potential supporters and investors.`

		const result = streamText({
			model: gateway('anthropic/claude-sonnet-4-5'),
			system: SYSTEM_PROMPT,
			messages: [{ role: 'user', content: userMessage }],
		})

		return result.toTextStreamResponse()
	} catch (err) {
		console.error('[pitch/analyze] Error:', err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
