import { db } from './firebase';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
}

export async function fetchQuestions(count: number = 10): Promise<Question[]> {
  const questionsRef = collection(db, 'questions');
  const q = query(questionsRef, orderBy('createdAt'), limit(count));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Question));
}

export function calculateScore(userAnswers: Record<string, string>, questions: Question[]): number {
  return questions.reduce((score, question) => {
    if (userAnswers[question.id] === question.correctAnswer) {
      return score + 1;
    }
    return score;
  }, 0);
}

