
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  isDefault: boolean;
  createdAt: Date;
  usageCount: number;
  tags: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}
