import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    throw new Error("API Key is missing in environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to convert File/Blob to Base64
const fileToGenerativePart = async (file: File | Blob) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type || 'image/jpeg',
    },
  };
};

export const generateSocialCaption = async (imageFile: File): Promise<string> => {
  try {
    const ai = getGeminiClient();
    const modelId = "gemini-2.5-flash-image"; // Good for multimodal analysis
    const imagePart = await fileToGenerativePart(imageFile);

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
            imagePart,
            { text: "这是一张用于社交媒体发布的九宫格拼图。请分析图片内容，写一段富有创意、吸引人且有趣的社交媒体文案（适用于微信朋友圈或小红书风格）。文案要捕捉到图片的氛围，包含一些相关的emoji表情。请保持简洁。" }
        ]
      },
    });

    return response.text || "无法生成文案。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "生成文案时出错，请检查您的 API 配置。";
  }
};