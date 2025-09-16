const { generateResponse } = require('./index');
const { Claude } = require('@anthropic-ai/sdk');

// index.test.js

// Mock the Claude SDK
jest.mock('@anthropic-ai/sdk');

describe('generateResponse', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should successfully generate a response', async () => {
        // Mock the complete method
        const mockCompletion = { completion: 'This is a test response' };
        Claude.prototype.complete = jest.fn().mockResolvedValue(mockCompletion);

        const prompt = 'Test prompt';
        const response = await generateResponse(prompt);

        expect(response).toBe('This is a test response');
        expect(Claude.prototype.complete).toHaveBeenCalledWith({
            prompt: prompt,
            model: 'claude-2',
            max_tokens: 1000
        });
    });

    it('should throw an error when API call fails', async () => {
        // Mock API error
        Claude.prototype.complete = jest.fn().mockRejectedValue(new Error('API Error'));

        const prompt = 'Test prompt';
        await expect(generateResponse(prompt)).rejects.toThrow('API Error');
    });

    it('should handle empty prompt', async () => {
        const mockCompletion = { completion: '' };
        Claude.prototype.complete = jest.fn().mockResolvedValue(mockCompletion);

        const response = await generateResponse('');
        expect(response).toBe('');
    });
});