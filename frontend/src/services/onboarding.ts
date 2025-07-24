// Stub service for onboarding actions
export async function createFirstTopic(name: string) {
  // TODO: Call /api/topics
  return { id: 'topic-1', name };
}

export async function uploadFirstPDF(file: File) {
  // TODO: Call /api/pdfs/upload
  return { id: 'pdf-1', title: file.name };
}

export async function setFirstGoal(goal: string) {
  // TODO: Call /api/goals
  return { id: 'goal-1', title: goal };
} 