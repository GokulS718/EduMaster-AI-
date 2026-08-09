export interface SubtopicSchema {
  name: string;
  description: string;
}

export interface SubjectCategorySchema {
  id: string;
  category: string;
  icon: string;
  description: string;
  subtopics: SubtopicSchema[];
}
