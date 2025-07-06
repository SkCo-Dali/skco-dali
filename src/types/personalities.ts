
export interface Personality {
  id: string;
  name: string;
  description: string;
  instructions: string;
  starterPhrases: string[];
  knowledgeFiles: PersonalityFile[];
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface PersonalityFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: Date;
}

export interface CreatePersonalityRequest {
  name: string;
  description: string;
  instructions: string;
  starterPhrases: string[];
  knowledgeFiles: File[];
  avatar?: File;
}
