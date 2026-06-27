import { gateway, streamText } from 'ai'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { logger } from '@/lib/logger'
import { nextAuthOption } from '~/lib/auth/auth-options'

export const maxDuration = 30

/** Free-tier-friendly default; override with AI_PITCH_ADVISOR_MODEL */
const DEFAULT_PITCH_ADVISOR_MODEL = 'google/gemini-2.5-flash-lite'

const stripHtml = (html: string): string =>
	html
		.replace(/<[^>]*>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

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

		const plainStory = stripHtml(story)
		if (!plainStory) {
			return NextResponse.json({ error: 'Story content is required for analysis' }, { status: 400 })
		}

		const userMessage = `Please analyze this project pitch and provide detailed feedback:

**Title:** ${title.trim()}

**Story/Description:**
${plainStory}

Provide specific, actionable recommendations to help improve this pitch for potential supporters and investors.`

		const modelId = process.env.AI_PITCH_ADVISOR_MODEL ?? DEFAULT_PITCH_ADVISOR_MODEL

		const result = streamText({
			model: gateway(modelId),
			system: SYSTEM_PROMPT,
			messages: [{ role: 'user', content: userMessage }],
			onError: ({ error }) => {
				logger.error('[pitch/analyze] Stream error:', error)
			},
		})

		const text = await result.text
		if (!text.trim()) {
			logger.error('[pitch/analyze] Empty analysis response for model:', modelId)
			return NextResponse.json(
				{
					error:
						'AI analysis could not be generated. The model may be unavailable — try again later or contact support.',
				},
				{ status: 503 },
			)
		}

		return new Response(text, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		})
	} catch (err) {
		logger.error('[pitch/analyze] Error:', err)
		return NextResponse.json(
			{ error: err instanceof Error ? err.message : 'Unknown error' },
			{ status: 500 },
		)
	}
}
