import AsyncStorage from '@react-native-async-storage/async-storage';
import geminiService, { GenerateDesignParams } from '../geminiService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('GeminiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });

  describe('API Key Management', () => {
    it('should set and retrieve API key', async () => {
      const testApiKey = 'test-api-key-123';
      
      await geminiService.setApiKey(testApiKey);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('gemini_api_key', testApiKey);
    });

    it('should clear API key', async () => {
      await geminiService.clearApiKey();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gemini_api_key');
    });

    it('should validate API key successfully', async () => {
      const testApiKey = 'valid-api-key';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const isValid = await geminiService.validateApiKey(testApiKey);
      
      expect(isValid).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`key=${testApiKey}`),
        expect.any(Object)
      );
    });

    it('should return false for invalid API key', async () => {
      const testApiKey = 'invalid-api-key';
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Unauthorized',
      });

      const isValid = await geminiService.validateApiKey(testApiKey);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Design Generation', () => {
    const mockParams: GenerateDesignParams = {
      imageBase64: 'base64imagedata',
      roomType: 'Living Room',
      style: 'Modern',
      colorPalette: 'Millennial Gray',
    };

    beforeEach(() => {
      // Mock API key retrieval
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
    });

    it('should generate design successfully', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inline_data: {
                    data: 'generated-image-base64',
                  },
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geminiService.generateDesign(mockParams);

      expect(result).toBeDefined();
      expect(result.imageBase64).toBe('generated-image-base64');
      expect(result.imageUrl).toBe('data:image/png;base64,generated-image-base64');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.model).toBe('gemini-2.0-flash-exp');
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: {
            message: 'Invalid request format',
          },
        }),
      });

      await expect(geminiService.generateDesign(mockParams)).rejects.toThrow(
        'API request failed: Invalid request format'
      );
    });

    it('should retry on failure with exponential backoff', async () => {
      // First two attempts fail, third succeeds
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inline_data: {
                        data: 'generated-image-base64',
                      },
                    },
                  ],
                },
              },
            ],
          }),
        });

      const result = await geminiService.generateDesign(mockParams);

      expect(result).toBeDefined();
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should throw error after max retry attempts', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(geminiService.generateDesign(mockParams)).rejects.toThrow(
        'Network error'
      );

      // Should attempt 3 times (initial + 2 retries)
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Design Regeneration', () => {
    const mockParams: GenerateDesignParams = {
      imageBase64: 'base64imagedata',
      roomType: 'Bedroom',
      style: 'Scandinavian',
      colorPalette: 'Forest Hues',
    };

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
    });

    it('should regenerate design with variations', async () => {
      const mockResponse = {
        candidates: [
          {
            content: {
              parts: [
                {
                  inline_data: {
                    data: 'regenerated-image-base64',
                  },
                },
              ],
            },
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await geminiService.regenerateDesign(mockParams, {
        colorPalette: 'Neon Sunset',
      });

      expect(result).toBeDefined();
      expect(result.imageBase64).toBe('regenerated-image-base64');
      
      // Check that the request includes higher temperature for variation
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      expect(requestBody.generationConfig.temperature).toBe(0.9);
    });
  });

  describe('Error Handling', () => {
    const mockParams: GenerateDesignParams = {
      imageBase64: 'base64imagedata',
      roomType: 'Kitchen',
      style: 'Industrial',
      colorPalette: 'Terracotta Mirage',
    };

    beforeEach(() => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
    });

    it('should handle missing API key error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      // Mock empty environment variable
      const originalEnv = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY;
      process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY = '';

      await expect(geminiService.generateDesign(mockParams)).rejects.toThrow(
        'Gemini API key not configured'
      );

      process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY = originalEnv;
    });

    it('should handle quota exceeded error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            message: 'Quota exceeded for this API',
          },
        }),
      });

      await expect(geminiService.generateDesign(mockParams)).rejects.toThrow(
        expect.stringContaining('quota')
      );
    });

    it('should handle safety filter errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            message: 'Content blocked by safety filters',
          },
        }),
      });

      await expect(geminiService.generateDesign(mockParams)).rejects.toThrow(
        expect.stringContaining('safety')
      );
    });

    it('should handle empty response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [],
        }),
      });

      await expect(geminiService.generateDesign(mockParams)).rejects.toThrow(
        'No generated content in response'
      );
    });
  });

  describe('Configuration', () => {
    it('should return configuration details', () => {
      const config = geminiService.getConfiguration();

      expect(config).toBeDefined();
      expect(config.model).toBe('gemini-2.0-flash-exp');
      expect(config.baseUrl).toContain('generativelanguage.googleapis.com');
      expect(config.retryConfig).toBeDefined();
      expect(config.limits).toBeDefined();
    });
  });

  describe('Prompt Generation', () => {
    it('should handle "Surprise Me" options correctly', async () => {
      const mockParams: GenerateDesignParams = {
        imageBase64: 'base64imagedata',
        roomType: 'Living Room',
        style: 'Surprise Me',
        colorPalette: 'Surprise Me',
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('test-api-key');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    inline_data: {
                      data: 'generated-image-base64',
                    },
                  },
                ],
              },
            },
          ],
        }),
      });

      await geminiService.generateDesign(mockParams);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      const promptText = requestBody.contents[0].parts[0].text;

      expect(promptText).toContain('creative and unique design style');
      expect(promptText).toContain('harmonious and creative color palette');
    });
  });
});