const TRIVIA_API_URL = 'https://opentdb.com/api.php?amount=50&type=multiple';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface FormattedQuestion {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchQuestions(retries = MAX_RETRIES): Promise<FormattedQuestion[]> {
  try {
    const response = await fetch(TRIVIA_API_URL);
    
    if (response.status === 429 && retries > 0) {
      console.log(`Rate limited. Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await delay(RETRY_DELAY);
      return fetchQuestions(retries - 1);
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.response_code !== 0) {
      throw new Error('Failed to fetch questions from Open Trivia DB');
    }

    return data.results.map((q: TriviaQuestion, index: number) => ({
      id: `q${index}`,
      category: q.category,
      text: decodeHTMLEntities(q.question),
      options: [...q.incorrect_answers, q.correct_answer]
        .map(decodeHTMLEntities)
        .sort(() => Math.random() - 0.5),
      correctAnswer: decodeHTMLEntities(q.correct_answer),
    }));
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

function decodeHTMLEntities(text: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

