const TRIVIA_API_URL = 'https://opentdb.com/api.php?amount=50&type=multiple'

export interface TriviaQuestion {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface TriviaApiResponse {
  response_code: number;
  results: TriviaQuestion[];
}

export async function fetchTriviaQuestions(): Promise<TriviaQuestion[]> {
  try {
    const response = await fetch(TRIVIA_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch questions from Open Trivia Database')
    }
    const data: TriviaApiResponse = await response.json()
    
    if (data.response_code !== 0) {
      throw new Error(`API Error: ${data.response_code}`)
    }

    return data.results
  } catch (error) {
    console.error('Error fetching from Open Trivia Database:', error)
    throw error
  }
}

