export function truncateText(content: string, maxWords: number): string {
  const words = content?.split(/\s+/);
  return words?.length > maxWords
    ? `${words.slice(0, maxWords).join(' ')}...`
    : content;
}

export function truncateHTMLContent(input: string, maxWords: number): string {
  try {
    // Create a temporary div to check if the input contains valid HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = input;

    // If the input is plain text, innerHTML will not change it, but textContent will match it
    if (tempDiv.textContent === input) {
      return truncateText(input, maxWords); // Plain text case
    }

    // Otherwise, extract text content from the HTML
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    return truncateText(textContent, maxWords);
  } catch (error) {
    console.error('Error processing input as HTML:', error);
    return truncateText(input, maxWords); // Fallback to plain text truncation
  }
}
