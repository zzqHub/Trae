import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  Copy,
  Check,
  Trash2,
  MoreHorizontal,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Code,
  ChevronRight,
  Bot,
  User,
  RefreshCw,
  X,
  FileText,
  Zap,
} from 'lucide-react';
import { useAiStore } from '@/store';
import { useProjectStore } from '@/store';
import type { AiMessage, CodeBlock, AiRecommendation } from '@/types';
import { cn } from '@/lib/utils';
import Editor from '@monaco-editor/react';

function CodeBlockDisplay({ codeBlock }: { codeBlock: CodeBlock }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeBlock.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 bg-slate-900/80">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-amber-500" />
          <span className="text-xs text-slate-400">{codeBlock.language}</span>
          {codeBlock.description && (
            <span className="text-xs text-slate-500">· {codeBlock.description}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors"
        >
          {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div className="relative h-[200px]">
        <Editor
          height="100%"
          language={codeBlock.language === 'structured-text' ? 'st' : codeBlock.language}
          value={codeBlock.code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
          isUser ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300'
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className={cn('max-w-[70%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-amber-600 text-white rounded-tr-sm'
              : 'bg-slate-700/80 text-slate-200 rounded-tl-sm border border-slate-600/50'
          )}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        </div>
        {message.codeBlocks && message.codeBlocks.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.codeBlocks.map((cb) => (
              <CodeBlockDisplay key={cb.id} codeBlock={cb} />
            ))}
          </div>
        )}
        {message.suggestions && message.suggestions.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-2 mt-3">
            {message.suggestions.map((sug) => (
              <button
                key={sug.id}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-700/50 border border-slate-600 text-slate-300 rounded-full hover:bg-slate-600/50 hover:border-slate-500 transition-all hover:scale-105"
              >
                {sug.icon === 'arrow-right' && <ChevronRight size={12} />}
                {sug.icon === 'help-circle' && <Lightbulb size={12} />}
                {sug.icon === 'code' && <Code size={12} />}
                {sug.icon === 'git-branch' && <Zap size={12} />}
                {sug.text}
              </button>
            ))}
          </div>
        )}
        <div className={cn('text-xs text-slate-500 mt-1.5', isUser ? 'text-right' : 'text-left')}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-700 text-slate-300 flex items-center justify-center">
        <Bot size={16} />
      </div>
      <div className="bg-slate-700/80 border border-slate-600/50 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  onDismiss,
}: {
  recommendation: AiRecommendation;
  onDismiss: (id: string) => void;
}) {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'module':
        return <Code size={16} className="text-blue-400" />;
      case 'template':
        return <FileText size={16} className="text-green-400" />;
      case 'optimization':
        return <Zap size={16} className="text-amber-400" />;
      case 'bestPractice':
        return <Lightbulb size={16} className="text-purple-400" />;
      case 'device':
        return <AlertTriangle size={16} className="text-red-400" />;
      default:
        return <Sparkles size={16} className="text-amber-400" />;
    }
  };

  const getSourceLabel = () => {
    const sourceMap: Record<string, string> = {
      ai: 'AI推荐',
      history: '历史推荐',
      popular: '热门推荐',
      similar: '相似项目',
    };
    return sourceMap[recommendation.source] || recommendation.source;
  };

  return (
    <div className="group relative bg-slate-700/30 border border-slate-600/50 rounded-lg p-3 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all">
      <button
        onClick={() => onDismiss(recommendation.id)}
        className="absolute top-2 right-2 p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-slate-200 truncate">{recommendation.title}</h4>
          </div>
          {recommendation.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{recommendation.description}</p>
          )}
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{getSourceLabel()}</span>
              <div className="flex items-center gap-1">
                <div className="w-12 h-1 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${recommendation.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{Math.round(recommendation.confidence * 100)}%</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 mt-2">
            {recommendation.actions.slice(0, 2).map((action) => (
              <button
                key={action.id}
                className={cn(
                  'text-xs px-2 py-1 rounded transition-colors',
                  action.type === 'apply'
                    ? 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-600/30'
                    : 'bg-slate-600/30 text-slate-400 hover:bg-slate-600/50'
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant() {
  const {
    conversations,
    currentConversationId,
    currentConversation,
    currentMessages,
    isTyping,
    recommendations,
    setCurrentConversation,
    createConversation,
    deleteConversation,
    sendMessage,
    dismissRecommendation,
    refreshRecommendations,
    searchConversations,
  } = useAiStore();

  const { currentProject } = useProjectStore();

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredConversations = searchQuery
    ? searchConversations(searchQuery)
    : conversations;

  const quickQuestions = [
    '如何优化电机控制程序？',
    '帮我生成PID控制代码',
    '模拟量滤波有哪些方法？',
    '急停安全回路怎么设计？',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const content = inputValue.trim();
    setInputValue('');
    await sendMessage(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    textareaRef.current?.focus();
  };

  const handleNewConversation = () => {
    createConversation('新对话', currentProject?.id);
  };

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    await refreshRecommendations();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex h-full bg-slate-900">
      {/* 左侧对话列表 */}
      <div className="w-64 flex-shrink-0 border-r border-slate-700/50 flex flex-col bg-slate-800/30">
        <div className="p-3 border-b border-slate-700/50">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            新建对话
          </button>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          <div className="space-y-1">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors',
                  currentConversationId === conv.id
                    ? 'bg-amber-600/20 border border-amber-500/30'
                    : 'hover:bg-slate-700/50 border border-transparent'
                )}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <MessageSquare
                  size={16}
                  className={cn(
                    'flex-shrink-0',
                    currentConversationId === conv.id ? 'text-amber-400' : 'text-slate-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm truncate flex-1',
                    currentConversationId === conv.id ? 'text-slate-100' : 'text-slate-400'
                  )}
                >
                  {conv.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 中间聊天区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 聊天头部 */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-700/50 bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <Sparkles size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                {currentConversation?.title || '新对话'}
              </h2>
              {currentProject && (
                <p className="text-xs text-slate-500">
                  项目: {currentProject.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentMessages.length === 0 && !isTyping ? (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-600/10 flex items-center justify-center mb-4">
                <Bot size={32} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">PLC AI 助手</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md text-center">
                我可以帮您生成PLC代码、优化程序逻辑、解答技术问题。有什么我可以帮您的吗？
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-lg">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-left px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all hover:scale-[1.02]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {currentMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 底部输入区 */}
        <div className="border-t border-slate-700/50 p-4 bg-slate-800/20">
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-slate-700/50 border border-slate-600/50 rounded-2xl focus-within:border-amber-500/50 focus-within:ring-1 focus-within:ring-amber-500/30 transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您的问题... (Enter发送，Shift+Enter换行)"
                rows={1}
                className="w-full px-4 py-3 pr-24 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 resize-none focus:outline-none rounded-2xl"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 rounded-lg transition-colors">
                  <Paperclip size={18} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-600 text-center mt-2">
              AI生成内容仅供参考，请仔细验证后使用
            </p>
          </div>
        </div>
      </div>

      {/* 右侧推荐面板 */}
      <div className="w-80 flex-shrink-0 border-l border-slate-700/50 flex flex-col bg-slate-800/30">
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              智能推荐
            </h3>
            <button
              onClick={handleRefreshRecommendations}
              className={cn(
                'p-1.5 text-slate-400 hover:text-slate-200 rounded transition-colors',
                isRefreshing && 'animate-spin'
              )}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div>
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">
              代码优化建议
            </h4>
            <div className="space-y-2">
              {recommendations
                .filter((r) => r.type === 'optimization' || r.type === 'module')
                .slice(0, 3)
                .map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onDismiss={dismissRecommendation}
                  />
                ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">
              异常检测
            </h4>
            <div className="space-y-2">
              <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-red-300">未使用的IO点</h5>
                    <p className="text-xs text-red-400/70 mt-0.5">
                      检测到 3 个已定义但未在程序中使用的IO点
                    </p>
                    <button className="text-xs text-red-400 hover:text-red-300 mt-2">
                      查看详情 →
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-amber-300">缺少注释</h5>
                    <p className="text-xs text-amber-400/70 mt-0.5">
                      FB_MotorControl 功能块缺少必要的注释说明
                    </p>
                    <button className="text-xs text-amber-400 hover:text-amber-300 mt-2">
                      自动添加 →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 px-1">
              模块推荐
            </h4>
            <div className="space-y-2">
              {recommendations
                .filter((r) => r.type === 'template' || r.type === 'bestPractice')
                .slice(0, 2)
                .map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onDismiss={dismissRecommendation}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
