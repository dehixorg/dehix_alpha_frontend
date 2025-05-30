import nlp from 'compromise';

/**
 * Tokenizes text into words using compromise.
 */
export const tokenizeText = (text: string): string[] => {
  const doc = nlp(text);
  return doc
    .terms()
    .out('array') // Ensure the output is an array of strings
    .map((term: string) => term.toLowerCase()); // Convert to lowercase
};

export const stemText = (text: string): string => {
  const doc = nlp(text);
  return doc
    .terms()
    .out('array') // Ensure the output is an array of strings
    .map((term: string) => nlp(term).terms().out('array')[0]) // Get the base form of the word
    .join('');
};

export const checkSpellingErrors = (text: string): string[] => {
  const tokenized = tokenizeText(text);
  const dictionary = [
    'javascript',
    'react',
    'developer',
    'experience',
    'project',
    'resume',
  ];
  return tokenized.filter((word) => !dictionary.includes(word)); // Check against a simple dictionary
};

export const calculateAtsScore = (
  resumeText: string,
  jobKeywords: string[],
): number => {
  const tokenizedResume = tokenizeText(resumeText);
  const lowercaseKeywords = jobKeywords.map((keyword) => keyword.toLowerCase()); // Convert keywords to lowercase
  const keywordCount = lowercaseKeywords.filter((keyword) =>
    tokenizedResume.includes(keyword),
  ).length;
  return Math.round((keywordCount / jobKeywords.length) * 100);
};

export const analyzeBrevity = (text: string): number => {
  const words = tokenizeText(text);
  return words.length; // Total word count (lower is better for brevity)
};

export const analyzeGrammar = (text: string): string[] => {
  const sentences = text
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return sentences.filter((sentence) => sentence.split('').length > 20); // Flags sentences over 20 words
};

export const analyzeStructure = (text: string): string[] => {
  const sections = [
    'education',
    'experience',
    'skills',
    'projects',
    'certifications',
  ];
  const missingSections = sections.filter(
    (section) => !text.toLowerCase().includes(section),
  );
  return missingSections;
};

export const analyzeResume = (resumeText: string, jobKeywords: string[]) => {
  const grammarIssues = analyzeGrammar(resumeText);
  const brevityScore = analyzeBrevity(resumeText);
  const structureIssues = analyzeStructure(resumeText);
  const atsScore = calculateAtsScore(resumeText, jobKeywords);
  const spellingMistakes = checkSpellingErrors(resumeText);

  // Score calculation (custom logic, tweak as needed)
  const grammarScore = Math.max(0, 100 - grammarIssues.length * 5); // Deduct 5 points per grammar issue
  const brevityNormalized = Math.max(0, 100 - Math.abs(brevityScore - 150)); // Targeting 150 words
  const sectionsScore = Math.max(0, (5 - structureIssues.length) * 20); // Deduct 20 points per missing section
  const totalScore = Math.round(
    (grammarScore + brevityNormalized + atsScore + sectionsScore) / 4,
  );

  return {
    totalScore,
    grammarScore,
    brevityScore: brevityNormalized,
    impactScore: atsScore,
    sectionsScore,
    spellingMistakes,
  };
};
