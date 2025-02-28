import { HfInference } from '@huggingface/inference'
import {
	analyzeSentiment,
	verifyBiometrics,
} from '~/services/ai/src/services/ai'

jest.mock('@huggingface/inference')

describe('AI Service', () => {
	const hfMock = HfInference as jest.MockedClass<typeof HfInference>

	beforeEach(() => {
		hfMock.mockClear()
	})

	test('analyzeSentiment should return sentiment analysis result', async () => {
		const mockResult = { label: 'positive', score: 0.95 }
		hfMock.prototype.sentimentAnalysis.mockResolvedValue(mockResult)

		const result = await analyzeSentiment('I love coding!')
		expect(result).toEqual(mockResult)
		expect(hfMock.prototype.sentimentAnalysis).toHaveBeenCalledWith({
			inputs: 'I love coding!',
		})
	})

	test('verifyBiometrics should return image classification result', async () => {
		const mockImage = Buffer.from('mockImageData')
		const mockResult = { label: 'person', confidence: 0.98 }
		hfMock.prototype.imageClassification.mockResolvedValue(mockResult)

		const result = await verifyBiometrics(mockImage)
		expect(result).toEqual(mockResult)
		expect(hfMock.prototype.imageClassification).toHaveBeenCalledWith({
			inputs: mockImage,
		})
	})
})
