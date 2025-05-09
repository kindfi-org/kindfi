import { createOpenAI } from '@ai-sdk/openai'
import { smoothStream, streamText } from 'ai'
import type { Request } from 'express'

export const openAiClient = createOpenAI({
	apiKey: process.env.OPENAI_API_KEY,
	compatibility: 'strict',
})

export async function createResponseStream(req?: Request) {
	if (!req) {
		throw new Error('Request is required')
	}

	const { messages } = req.body

	try {
		const openaiModel = openAiClient('gpt-4o')

		if (!messages || !Array.isArray(messages)) {
			throw new Error('Invalid messages format')
		}

		const openAiStreamConfig = {
			model: openaiModel,
			messages,
			maxRetries: 2,
			experimental_transform: smoothStream({
				delayInMs: 50,
				chunking: 'line',
			}),
		}

		const response = streamText(openAiStreamConfig)

		// const dataStreamResponse = response.toDataStreamResponse({
		// 	getErrorMessage(error) {
		// 		if (error instanceof Error) return error.message
		// 		return 'Failed to process the request'
		// 	},
		// })

		return response
	} catch (error) {
		console.error('--- ERROR IN createResponseStream ---')
		throw error
	}
}

// export async function createResponseStreamObject(
// 	schema: ZodType<unknown>,
// 	req: Request,
// ) {
// 	const { prompt } = req.body

// 	try {
// 		const openaiModel = openAiClient('gpt-4')
//     const stream = createDataStreamResponse({
//       execute: async (dataStreamWriter) => {
//         const { partialObjectStream } = streamObject({
//           model: openaiModel,
//           schema,
//           output: 'object',
//           prompt,
//         })

//         // ? This validates the object stream before to return a object stream
//         for await (const objectStream of partialObjectStream) {
//           if (!objectStream) {
//             throw new Error(
//               'Failed to process the request, object stream is null',
//             )
//           }

//           dataStreamWriter.merge(partialObjectStream)
//         }

//         return dataStreamWriter.merge(partialObjectStream)
//       }
//     })
// 	} catch (error) {
// 		console.error('Error in createResponseStreamObject:', error)
// 		throw error
// 	}
// }
