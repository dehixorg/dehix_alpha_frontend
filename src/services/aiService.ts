import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    'API key not found. Please set GEMINI_API_KEY in your .env.local file.',
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

// Configuration for generation
const generationConfig: {
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  responseMimeType: string;
} = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8000,
  responseMimeType: 'application/json',
};

/**
 * Start a chat session with the AI and send a prompt
 * @param prompt - The input text for the AI
 * @returns The AI-generated response as a string
 */
export const generateAIResponse = async (prompt: string): Promise<string> => {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: 'user',
        parts: [
          {
            text: 'Job Title: {jobTitle} ,depends on job title give me summary for my resume within 4-5 lines in JSON format with field experience Level and summary with experience for fresher ,mid-level and experienced',
          },
        ],
      },
      {
        role: 'model',
        parts: [
          {
            text: '```json\n{\n  "jobTitle": "{jobTitle}",\n  "experienceLevels": [\n    {\n      "level": "Fresher",\n      "summary": [\n        "Highly motivated and enthusiastic {jobTitle} graduate seeking an entry-level position.",\n        "Possesses strong foundation in {relevant skills/knowledge} gained through academic coursework and projects.",\n        "Eager to learn and contribute to a dynamic team environment.",\n        "Proven ability to adapt quickly to new challenges and technologies.",\n        "Seeking opportunities to apply theoretical knowledge and develop practical skills."\n      ]\n    },\n    {\n      "level": "Mid-Level",\n      "summary": [\n        "Experienced {jobTitle} with {number} years of progressive experience in {industry/field}.",\n        "Proven track record of success in {achievements/responsibilities, e.g., project management, team leadership, problem-solving}.",\n        "Skilled in {relevant technical skills and tools}.",\n        "Demonstrated ability to meet deadlines and exceed expectations in fast-paced environments.",\n        "Seeking a challenging role with opportunities for growth and advancement."\n      ]\n    },\n    {\n      "level": "Experienced",\n      "summary": [\n        "Highly accomplished {jobTitle} with {number} years of experience leading and mentoring teams.",\n        "Extensive expertise in {relevant technical skills and tools, and specific areas of expertise}.",\n        "Successful track record of developing and implementing innovative solutions that have yielded significant results.",\n        "Proven ability to manage complex projects, budgets, and resources effectively.",\n        "A strategic thinker with a strong understanding of industry trends and best practices."\n      ]\n    }\n  ]\n}\n```\n\n**To use this:**\n\n1. **Replace `{jobTitle}`** with the actual job title (e.g., "Software Engineer", "Marketing Manager", "Data Analyst").\n2. **Replace the bracketed placeholders** within the summaries with specific details relevant to the job title and the candidate\'s experience.  For example,  replace `{relevant skills/knowledge}` with "Java programming, data structures, and algorithms" for a Software Engineer Fresher.  For a Mid-Level role you might replace `{achievements/responsibilities}` with  "managing software development projects, leading a team of 5 engineers, delivering projects on time and within budget".\n\n\nThis JSON provides a flexible structure that can be easily adapted to different job titles and experience levels. Remember to tailor the content to accurately reflect the candidate\'s skills and accomplishments.\n',
          },
        ],
      },
    ],
  });

  // Send the message and get the response
  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
};
