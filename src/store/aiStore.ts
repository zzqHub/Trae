import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  AiConversation,
  AiMessage,
  AiRecommendation,
  AiAttachment,
  CodeBlock,
  AiSuggestion,
  ChatContext,
  MessageRole,
  RecommendationType,
  RecommendationSource,
} from '../types';

const mockConversations: AiConversation[] = [
  {
    id: 'conv-001',
    title: 'PLC程序优化建议',
    messages: [
      {
        id: 'msg-001',
        role: 'user',
        content: '你好，我想优化一下我的电机控制程序，有什么建议吗？',
        status: 'sent',
        timestamp: '2026-07-01T09:00:00Z',
      },
      {
        id: 'msg-002',
        role: 'assistant',
        content: '您好！关于电机控制程序的优化，我有以下几点建议：\n\n1. **使用功能块(FB)封装**：将电机控制逻辑封装为独立的功能块，便于复用和维护\n2. **增加状态机管理**：使用状态机管理电机的各种状态（空闲、启动、运行、停止、故障）\n3. **添加防抖处理**：对输入信号进行防抖处理，防止误触发\n4. **完善故障诊断**：增加故障代码和诊断信息\n\n需要我帮您生成具体的代码实现吗？',
        status: 'sent',
        timestamp: '2026-07-01T09:00:05Z',
        suggestions: [
          { id: 'sug-001', type: 'quickReply', text: '生成功能块代码', icon: 'code' },
          { id: 'sug-002', type: 'quickReply', text: '状态机实现', icon: 'git-branch' },
          { id: 'sug-003', type: 'question', text: '如何处理过载保护？', icon: 'help-circle' },
        ],
      },
    ],
    projectId: 'proj-001',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:05Z',
  },
  {
    id: 'conv-002',
    title: '模拟量采集问题',
    messages: [
      {
        id: 'msg-003',
        role: 'user',
        content: '模拟量信号波动很大，怎么处理？',
        status: 'sent',
        timestamp: '2026-07-02T14:30:00Z',
      },
      {
        id: 'msg-004',
        role: 'assistant',
        content: '模拟量信号波动是常见问题，以下是几种常用的滤波方法：\n\n**1. 均值滤波**\n取多个采样值的平均值，适合消除随机噪声。\n\n**2. 一阶滞后滤波**\n使用加权平均，响应速度和滤波效果可通过系数调节。\n\n**3. 中值滤波**\n取排序后的中间值，适合消除脉冲干扰。\n\n**4. 限幅滤波**\n限制每次采样值的变化范围，防止突变。\n\n建议根据实际场景组合使用，比如先限幅再均值滤波。需要我提供具体的PLC代码实现吗？',
        status: 'sent',
        timestamp: '2026-07-02T14:30:08Z',
        codeBlocks: [
          {
            id: 'cb-001',
            language: 'structured-text',
            code: `// 均值滤波功能块示例\nFUNCTION_BLOCK FB_AverageFilter\nVAR_INPUT\n  RawValue: INT;\n  Enable: BOOL;\nEND_VAR\nVAR_OUTPUT\n  FilteredValue: INT;\n  Valid: BOOL;\nEND_VAR\nVAR\n  Buffer: ARRAY[0..9] OF INT;\n  Index: INT := 0;\n  Sum: DINT := 0;\n  i: INT;\nEND_VAR\n\nIF Enable THEN\n  Buffer[Index] := RawValue;\n  Index := (Index + 1) MOD 10;\n  \n  Sum := 0;\n  FOR i := 0 TO 9 DO\n    Sum := Sum + Buffer[i];\n  END_FOR;\n  \n  FilteredValue := INT(Sum / 10);\n  Valid := TRUE;\nEND_IF;`,
            description: '均值滤波功能块实现',
            canApply: true,
            applyTarget: 'module',
          },
        ],
      },
    ],
    projectId: 'proj-001',
    createdAt: '2026-07-02T14:30:00Z',
    updatedAt: '2026-07-02T14:30:08Z',
  },
];

const mockRecommendations: AiRecommendation[] = [
  {
    id: 'rec-001',
    type: 'module',
    title: '使用标准电机控制模块',
    description: '检测到您有多个类似的电机控制逻辑，建议使用标准功能块替换以提高代码复用率',
    source: 'ai',
    confidence: 0.92,
    createdAt: '2026-07-03T10:00:00Z',
    targetType: 'module',
    actions: [
      { id: 'act-001', label: '应用模板', type: 'apply' },
      { id: 'act-002', label: '查看详情', type: 'view' },
      { id: 'act-003', label: '忽略', type: 'dismiss' },
    ],
  },
  {
    id: 'rec-002',
    type: 'optimization',
    title: '优化模拟量滤波参数',
    description: '根据历史数据分析，建议将滤波强度从5调整为7，可进一步降低噪声约15%',
    source: 'history',
    confidence: 0.78,
    createdAt: '2026-07-03T11:00:00Z',
    targetType: 'module',
    metadata: { beforeFilter: 5, afterFilter: 7, noiseReduction: '15%' },
    actions: [
      { id: 'act-004', label: '应用优化', type: 'apply' },
      { id: 'act-005', label: '了解更多', type: 'learnMore' },
    ],
  },
  {
    id: 'rec-003',
    type: 'bestPractice',
    title: '添加急停安全回路',
    description: '安全规范要求所有运动设备必须配备急停按钮和安全回路',
    source: 'popular',
    confidence: 0.95,
    createdAt: '2026-07-03T12:00:00Z',
    actions: [
      { id: 'act-006', label: '查看规范', type: 'view' },
      { id: 'act-007', label: '添加模板', type: 'apply' },
    ],
  },
  {
    id: 'rec-004',
    type: 'template',
    title: '推荐：PID温度控制模板',
    description: '您的项目包含温度控制场景，这个模板可能对您有帮助',
    source: 'similar',
    confidence: 0.85,
    createdAt: '2026-07-03T13:00:00Z',
    targetId: 'tpl-008',
    targetType: 'template',
    actions: [
      { id: 'act-008', label: '使用模板', type: 'apply' },
      { id: 'act-009', label: '预览', type: 'view' },
    ],
  },
];

interface AiStore {
  conversations: AiConversation[];
  currentConversationId: string | null;
  recommendations: AiRecommendation[];
  chatContext: ChatContext;
  isTyping: boolean;
  isLoading: boolean;
  sidebarOpen: boolean;

  get currentConversation(): AiConversation | undefined;
  get currentMessages(): AiMessage[];

  setCurrentConversation: (conversationId: string | null) => void;
  setChatContext: (context: Partial<ChatContext>) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  createConversation: (title?: string, projectId?: string) => AiConversation;
  deleteConversation: (conversationId: string) => void;
  renameConversation: (conversationId: string, title: string) => void;
  duplicateConversation: (conversationId: string) => AiConversation;
  clearConversations: () => void;

  sendMessage: (content: string, attachments?: AiAttachment[]) => Promise<void>;
  addMessage: (conversationId: string, message: Omit<AiMessage, 'id' | 'timestamp'>) => AiMessage;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<AiMessage>) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;

  addAttachment: (conversationId: string, messageId: string, attachment: Omit<AiAttachment, 'id'>) => void;
  addCodeBlock: (conversationId: string, messageId: string, codeBlock: Omit<CodeBlock, 'id'>) => void;
  addSuggestion: (conversationId: string, messageId: string, suggestion: Omit<AiSuggestion, 'id'>) => void;

  getRecommendations: (type?: RecommendationType, source?: RecommendationSource) => AiRecommendation[];
  dismissRecommendation: (recommendationId: string) => void;
  refreshRecommendations: () => Promise<void>;

  searchConversations: (query: string) => AiConversation[];

  exportConversation: (conversationId: string) => string;
  importConversation: (jsonString: string) => AiConversation | null;
}

export type { AiStore };

export const useAiStore = create<AiStore>((set, get) => ({
  conversations: mockConversations,
  currentConversationId: mockConversations.length > 0 ? mockConversations[0].id : null,
  recommendations: mockRecommendations,
  chatContext: {},
  isTyping: false,
  isLoading: false,
  sidebarOpen: true,

  get currentConversation() {
    const { conversations, currentConversationId } = get();
    return conversations.find((c) => c.id === currentConversationId);
  },

  get currentMessages() {
    return get().currentConversation?.messages ?? [];
  },

  setCurrentConversation: (conversationId) => set({ currentConversationId: conversationId }),

  setChatContext: (context) =>
    set((state) => ({ chatContext: { ...state.chatContext, ...context } })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  createConversation: (title = '新对话', projectId) => {
    const now = new Date().toISOString();
    const newConversation: AiConversation = {
      id: `conv-${uuidv4().slice(0, 8)}`,
      title,
      messages: [],
      projectId,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
    }));
    return newConversation;
  },

  deleteConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      currentConversationId:
        state.currentConversationId === conversationId
          ? state.conversations.length > 1
            ? state.conversations.find((c) => c.id !== conversationId)?.id ?? null
            : null
          : state.currentConversationId,
    })),

  renameConversation: (conversationId, title) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, title, updatedAt: new Date().toISOString() } : c
      ),
    })),

  duplicateConversation: (conversationId) => {
    const conversation = get().conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');
    const now = new Date().toISOString();
    const newConversation: AiConversation = JSON.parse(JSON.stringify(conversation));
    newConversation.id = `conv-${uuidv4().slice(0, 8)}`;
    newConversation.title = `${conversation.title} 副本`;
    newConversation.createdAt = now;
    newConversation.updatedAt = now;
    newConversation.messages = newConversation.messages.map((m) => ({
      ...m,
      id: `msg-${uuidv4().slice(0, 8)}`,
    }));
    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      currentConversationId: newConversation.id,
    }));
    return newConversation;
  },

  clearConversations: () =>
    set({
      conversations: [],
      currentConversationId: null,
    }),

  sendMessage: async (content, attachments) => {
    const state = get();
    let conversationId = state.currentConversationId;

    if (!conversationId) {
      const newConv = get().createConversation(content.slice(0, 30) + '...');
      conversationId = newConv.id;
    }

    const userMessage: AiMessage = {
      id: `msg-${uuidv4().slice(0, 8)}`,
      role: 'user',
      content,
      status: 'sending',
      timestamp: new Date().toISOString(),
      attachments,
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      isTyping: true,
    }));

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === userMessage.id ? { ...m, status: 'sent' as const } : m
              ),
            }
          : c
      ),
    }));

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiMessage: AiMessage = {
      id: `msg-${uuidv4().slice(0, 8)}`,
      role: 'assistant',
      content: `这是对"${content}"的模拟回复。在实际应用中，这里会调用AI服务生成真实的回复内容。\n\n感谢您的提问！`,
      status: 'sent',
      timestamp: new Date().toISOString(),
      suggestions: [
        { id: `sug-${uuidv4().slice(0, 8)}`, type: 'quickReply', text: '继续深入', icon: 'arrow-right' },
        { id: `sug-${uuidv4().slice(0, 8)}`, type: 'question', text: '举个例子', icon: 'help-circle' },
      ],
    };

    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: [...c.messages, aiMessage],
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
      isTyping: false,
    }));
  },

  addMessage: (conversationId, message) => {
    const newMessage: AiMessage = {
      id: `msg-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...message,
    };
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, newMessage], updatedAt: new Date().toISOString() }
          : c
      ),
    }));
    return newMessage;
  },

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
            }
          : c
      ),
    })),

  deleteMessage: (conversationId, messageId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
          : c
      ),
    })),

  clearMessages: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, messages: [], updatedAt: new Date().toISOString() } : c
      ),
    })),

  addAttachment: (conversationId, messageId, attachment) => {
    const newAttachment: AiAttachment = {
      id: `att-${uuidv4().slice(0, 8)}`,
      ...attachment,
    };
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId
                  ? { ...m, attachments: [...(m.attachments ?? []), newAttachment] }
                  : m
              ),
            }
          : c
      ),
    }));
  },

  addCodeBlock: (conversationId, messageId, codeBlock) => {
    const newCodeBlock: CodeBlock = {
      id: `cb-${uuidv4().slice(0, 8)}`,
      ...codeBlock,
    };
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId
                  ? { ...m, codeBlocks: [...(m.codeBlocks ?? []), newCodeBlock] }
                  : m
              ),
            }
          : c
      ),
    }));
  },

  addSuggestion: (conversationId, messageId, suggestion) => {
    const newSuggestion: AiSuggestion = {
      id: `sug-${uuidv4().slice(0, 8)}`,
      ...suggestion,
    };
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId
                  ? { ...m, suggestions: [...(m.suggestions ?? []), newSuggestion] }
                  : m
              ),
            }
          : c
      ),
    }));
  },

  getRecommendations: (type, source) => {
    return get().recommendations.filter((r) => {
      const matchesType = !type || r.type === type;
      const matchesSource = !source || r.source === source;
      return matchesType && matchesSource;
    });
  },

  dismissRecommendation: (recommendationId) =>
    set((state) => ({
      recommendations: state.recommendations.filter((r) => r.id !== recommendationId),
    })),

  refreshRecommendations: async () => {
    set({ isLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 800));
    set({ isLoading: false });
  },

  searchConversations: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(lowerQuery) ||
        c.messages.some((m) => m.content.toLowerCase().includes(lowerQuery))
    );
  },

  exportConversation: (conversationId) => {
    const conversation = get().conversations.find((c) => c.id === conversationId);
    if (!conversation) throw new Error('Conversation not found');
    return JSON.stringify(conversation, null, 2);
  },

  importConversation: (jsonString) => {
    try {
      const conversation = JSON.parse(jsonString) as AiConversation;
      if (!conversation.id || !conversation.title) return null;
      set((state) => ({
        conversations: [conversation, ...state.conversations],
        currentConversationId: conversation.id,
      }));
      return conversation;
    } catch {
      return null;
    }
  },
}));
