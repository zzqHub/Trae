export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'sending' | 'sent' | 'error' | 'loading';

export type RecommendationType =
  | 'module'
  | 'template'
  | 'device'
  | 'rule'
  | 'optimization'
  | 'bestPractice';

export type RecommendationSource = 'ai' | 'history' | 'popular' | 'similar';

export interface AiConversation {
  id: string;
  title: string;
  messages: AiMessage[];
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiMessage {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  timestamp: string;
  attachments?: AiAttachment[];
  codeBlocks?: CodeBlock[];
  suggestions?: AiSuggestion[];
  errorMessage?: string;
}

export interface AiAttachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'code';
  url?: string;
  size?: number;
}

export interface CodeBlock {
  id: string;
  language: string;
  code: string;
  description?: string;
  canApply?: boolean;
  applyTarget?: string;
}

export interface AiSuggestion {
  id: string;
  type: 'quickReply' | 'action' | 'question';
  text: string;
  icon?: string;
  actionData?: Record<string, unknown>;
}

export interface AiRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description?: string;
  source: RecommendationSource;
  confidence: number;
  createdAt: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  actions: RecommendationAction[];
}

export interface RecommendationAction {
  id: string;
  label: string;
  type: 'apply' | 'view' | 'dismiss' | 'learnMore';
  actionData?: Record<string, unknown>;
}

export interface ChatContext {
  projectId?: string;
  stationId?: string;
  deviceId?: string;
  moduleId?: string;
  selectedItems?: string[];
  currentView?: string;
}

export interface AiServiceConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
  baseUrl?: string;
}

export interface AiResponseMetadata {
  model: string;
  provider: string;
  completionTime?: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ModuleRecommendation extends AiRecommendation {
  type: 'module';
  moduleTemplateId?: string;
}

export interface TemplateRecommendation extends AiRecommendation {
  type: 'template';
  templateId?: string;
}

export interface OptimizationRecommendation extends AiRecommendation {
  type: 'optimization';
  optimizationType: string;
  beforeCode?: string;
  afterCode?: string;
  description: string;
}
