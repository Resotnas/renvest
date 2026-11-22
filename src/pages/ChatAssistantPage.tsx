import React, { useEffect, useRef, useState } from 'react';
import {
  History,
  SquarePen,
  X,
  Paperclip,
  Mic,
  ArrowUp,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { RenVestLoader } from '../components/RenVestLoader';
import { DonaReEmblem } from '../components/DonaReEmblem';
import { ChatMessage } from '../types';
import { askDonaRe } from '../services/geminiApi';
import {
  clearUserChatMessages,
  fetchUserChatMessages,
  insertUserChatMessage,
} from '../lib/supabase';
import { MARKET_ASSETS, MACRO_INDICATORS } from '../data/mockMarket';

const SUGGESTED_PROMPTS = [
  'Buscar cotação e dividendos de PETR4',
  'Como está minha carteira hoje?',
  'Onde aportar R$ 1.000 no meu perfil?',
  'O que os números mostram sobre MXRF11?',
];

const CHAT_STORAGE_KEY = 'renvest_dona_re_chat_v1';

function buildDonaReReply(
  question: string,
  investorProfile: string,
  portfolio: { name: string; category: string; investedValue: number; currentValue: number; institution: string }[]
): string {
  const q = question.toLowerCase();

  // Check if user mentioned any known ticker
  const matchedAsset = MARKET_ASSETS.find(
    (a) => q.includes(a.ticker.toLowerCase()) || q.includes(a.name.toLowerCase().split(' ')[0])
  );

  if (matchedAsset) {
    const dir = matchedAsset.changePercent >= 0 ? 'alta' : 'queda';
    const extraMetric =
      matchedAsset.type === 'FII'
        ? `P/VP de **${matchedAsset.pvp?.toFixed(2)}x**`
        : `P/L de **${matchedAsset.pl?.toFixed(1)}x**`;

    return `Aqui estão os dados atuais de **${matchedAsset.ticker} (${matchedAsset.name})**:\n\n• **Cotação:** R$ ${matchedAsset.price.toFixed(2).replace('.', ',')} (${dir} de ${matchedAsset.changePercent >= 0 ? '+' : ''}${matchedAsset.changePercent.toFixed(2)}% hoje)\n• **Dividend Yield:** ${matchedAsset.dividendYield.toFixed(2)}% a.a.\n• **Indicador:** ${extraMetric} • Valor de mercado: ${matchedAsset.marketCap}\n\n${matchedAsset.summary}\n\n💡 *Dica da Dona Rê:* Para seu perfil **${investorProfile}**, você pode aprofundar a projeção de 5 anos na aba **Aportar → Ativo Único**.`;
  }

  // Portfolio question
  if (q.includes('carteira') || q.includes('patrim') || q.includes('saldo') || q.includes('quanto tenho')) {
    const totalInvested = portfolio.reduce((s, a) => s + a.investedValue, 0);
    const totalCurrent = portfolio.reduce((s, a) => s + a.currentValue, 0);
    const profit = totalCurrent - totalInvested;
    const pct = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
    const topAsset = [...portfolio].sort((a, b) => b.currentValue - a.currentValue)[0];

    return `Olhei sua carteira agora! Aqui vai o resumo:\n\n• **Valor Atual:** R$ ${totalCurrent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• **Total Aportado:** R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n• **Resultado:** ${profit >= 0 ? '+' : ''}R$ ${profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${profit >= 0 ? '+' : ''}${pct.toFixed(2)}%)\n• **Ativos cadastrados:** ${portfolio.length}${topAsset ? ` • Maior posição: **${topAsset.name}** (${topAsset.institution})` : ''}\n\nSua carteira está ${profit >= 0 ? 'no azul 👏' : 'em leve oscilação negativa'}. Quer que eu sugira onde colocar seu próximo aporte?`;
  }

  // Macro indicators
  if (q.includes('selic') || q.includes('cdi') || q.includes('dólar') || q.includes('dolar')) {
    const usd = MACRO_INDICATORS.find((m) => m.id === 'usd');
    const selic = MACRO_INDICATORS.find((m) => m.id === 'selic');
    const cdi = MACRO_INDICATORS.find((m) => m.id === 'cdi');
    return `Os indicadores macro de hoje estão assim:\n\n• **Dólar (USD/BRL):** ${usd?.value} (${usd?.changeLabel})\n• **Taxa Selic:** ${selic?.value} a.a.\n• **CDI:** ${cdi?.value} a.a.\n\nCom a Selic acima de 11%, a Renda Fixa (Tesouro Selic, IPCA+ e CDBs > 105% CDI) continua pagando juros reais muito atrativos para compor a base da carteira.`;
  }

  // Allocation / Aporte
  if (q.includes('aportar') || q.includes('investir') || q.includes('divis') || q.includes('onde')) {
    const matchVal = question.match(/\d[\d.,]*/);
    const amountStr = matchVal ? `R$ ${matchVal[0]}` : 'R$ 1.000';
    const splitText =
      investorProfile === 'Conservador'
        ? '45% Tesouro Direto, 35% CDBs, 15% FIIs e 5% Ações'
        : investorProfile === 'Arrojado'
          ? '45% Ações, 30% FIIs, 15% Tesouro Direto e 10% CDBs'
          : '30% Tesouro Direto, 20% CDBs, 25% FIIs e 25% Ações';

    return `Para um aporte de **${amountStr}** no seu perfil **${investorProfile}**, uma divisão equilibrada seria:\n\n• **Sugestão base:** ${splitText}.\n• **FIIs em destaque:** MXRF11 (DY 12,15%) e HGLG11 (DY 8,62%).\n• **Ações resilientes:** ITUB4 e WEGE3.\n• **Renda Fixa:** Tesouro IPCA+ 2035 ou CDB 112% CDI.\n\nSe quiser ver o gráfico completo com pontos positivos e negativos, clique na aba **Aportar** no menu!`;
  }

  return `Entendi sua dúvida sobre *"${question}"*! 😊\n\nNo modo protótipo (Fase 1), já consigo consultar seus **${portfolio.length} ativos cadastrados**, seu perfil **${investorProfile}**, além de cotações e dividendos de ativos como **PETR4, WEGE3, ITUB4, VALE3, MXRF11, HGLG11 e XPML11**.\n\nNa **Fase 2**, estarei conectada diretamente ao **Google Gemini + Brapi + Banco Central** em tempo real!`;
}

export const ChatAssistantPage: React.FC = () => {
  const {
    user,
    authUserId,
    portfolio,
    macroIndicators,
    marketAssets,
    previousTab,
    setActiveTab,
  } = useApp();
  const { playInsight } = useSoundEffects();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      return saved ? (JSON.parse(saved) as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistoryBanner, setShowHistoryBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync chat history from Supabase when logged in
  useEffect(() => {
    if (!authUserId) return;
    fetchUserChatMessages(authUserId).then((cloudMsgs) => {
      if (cloudMsgs.length > 0) setMessages(cloudMsgs);
    });
  }, [authUserId]);

  useEffect(() => {
    if (!authUserId) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, authUserId]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: now,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setIsTyping(true);

    if (authUserId) {
      void insertUserChatMessage(authUserId, 'user', trimmed);
    }

    const startedAt = Date.now();
    const { text: geminiReply, usedRealAi } = await askDonaRe({
      question: trimmed,
      profile: user.investorProfile,
      portfolio,
      macro: macroIndicators,
      marketAssets,
      recentHistory: nextHistory,
    });

    const elapsed = Date.now() - startedAt;
    if (!usedRealAi && elapsed < 750) {
      await new Promise((r) => setTimeout(r, 750 - elapsed));
    }

    const replyText =
      geminiReply || buildDonaReReply(trimmed, user.investorProfile, portfolio);

    const aiMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: replyText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
    playInsight();

    if (authUserId) {
      void insertUserChatMessage(authUserId, 'assistant', replyText);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setShowHistoryBanner(false);
    if (authUserId) {
      void clearUserChatMessages(authUserId);
    }
  };

  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      return (
        <p key={i} className={line.trim() === '' ? 'h-2' : 'leading-relaxed'}>
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={idx} className="font-bold text-primary">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith('*') && part.endsWith('*')) {
              return (
                <em key={idx} className="opacity-90">
                  {part.slice(1, -1)}
                </em>
              );
            }
            return <React.Fragment key={idx}>{part}</React.Fragment>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-118px)] sm:h-[calc(100vh-140px)] relative">
      {/* Top Bar (inspired by reference screenshot) */}
      <header className="flex items-center justify-between pb-3 mb-2 border-b glass-divider shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[1.5px] shadow-md shadow-emerald-500/25">
            <div className="w-full h-full rounded-[14.5px] bg-slate-950/90 flex items-center justify-center">
              <span className="font-display font-extrabold text-base bg-gradient-to-br from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                R
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-extrabold text-sm text-primary leading-none">
                Dona Rê
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                IA
              </span>
            </div>
            <p className="text-[11px] text-secondary mt-0.5">
              Assistente de IA • Mercado e Carteira
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistoryBanner((v) => !v)}
            title="Histórico da conversa"
            aria-label="Histórico da conversa"
            className="tap-press w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNewChat}
            title="Nova conversa"
            aria-label="Nova conversa"
            className="tap-press w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
          >
            <SquarePen className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveTab(previousTab === 'chat' ? 'home' : previousTab)}
            title="Fechar chat"
            aria-label="Fechar chat"
            className="tap-press w-8 h-8 rounded-xl glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Optional History Info Strip */}
      {showHistoryBanner && (
        <div className="mb-2 glass-card-subtle rounded-2xl px-3.5 py-2.5 flex items-center justify-between text-xs animate-enter shrink-0">
          <span className="text-secondary">
            {messages.length} mensagem(ns) salva(s) localmente
          </span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleNewChat}
              className="tap-press inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Limpar
            </button>
          )}
        </div>
      )}

      {/* Main Scrollable Chat Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-3">
        {messages.length === 0 ? (
          /* Empty State matching reference screenshot */
          <div className="h-full flex flex-col items-center justify-center text-center px-3 py-4 relative">
            {/* Soft ambient particles */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <span className="absolute top-12 left-10 w-2 h-2 rounded-full bg-emerald-400/35 blur-[1px]" />
              <span className="absolute top-28 right-12 w-1.5 h-1.5 rounded-full bg-cyan-400/40 blur-[1px]" />
              <span className="absolute bottom-24 left-16 w-2 h-2 rounded-full bg-teal-400/30 blur-[1px]" />
              <span className="absolute bottom-14 right-16 w-1.5 h-1.5 rounded-full bg-emerald-500/35 blur-[1px]" />
            </div>

            {/* Animated Liquid Glass Dona Rê Emblem */}
            <DonaReEmblem />

            <h2 className="text-2xl font-display font-extrabold text-primary tracking-tight">
              Como posso ajudar?
            </h2>
            <p className="text-xs text-secondary mt-2 max-w-[290px] leading-relaxed">
              Cotações, dividendos, análise da sua carteira e recomendações de aporte personalizadas pela <strong className="text-primary">Dona Rê</strong>.
            </p>

            {/* Stacked Pill Prompts (matching screenshot) */}
            <div className="mt-6 flex flex-col items-center gap-2.5 w-full max-w-[330px]">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="tap-press px-4 py-2.5 rounded-full glass-pill hover:border-emerald-500/45 text-xs font-medium text-primary transition-all cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Conversation Messages */
          <div className="space-y-3 pb-2">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-enter`}
                >
                  <div
                    className={`max-w-[86%] rounded-3xl px-4 py-3 text-xs space-y-1 ${
                      isUser
                        ? 'liquid-btn rounded-br-lg text-white'
                        : 'glass-card-elevated rounded-bl-lg text-secondary'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                        <Sparkles className="w-3 h-3" />
                        Dona Rê
                      </div>
                    )}
                    <div className={isUser ? 'text-white leading-relaxed' : ''}>
                      {isUser ? msg.content : renderFormattedText(msg.content)}
                    </div>
                    <p
                      className={`text-[9px] text-right pt-0.5 ${
                        isUser ? 'text-white/75' : 'text-muted'
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex justify-start">
                <div className="glass-card rounded-3xl rounded-bl-lg px-3.5 py-2.5">
                  <RenVestLoader
                    variant="inline"
                    size="sm"
                    visible={isTyping}
                    message="Dona Rê analisando..."
                  />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Composer Box (matching screenshot) */}
      <div className="pt-2 shrink-0">
        <div className="glass-card-elevated rounded-[26px] p-3 space-y-2.5">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte à Dona Rê sobre sua carteira, cotações ou dividendos..."
            className="w-full resize-none bg-transparent text-xs sm:text-sm text-primary placeholder:text-muted focus:outline-none px-1 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2 text-muted">
              <button
                type="button"
                title="Anexar (disponível na Fase 2)"
                className="tap-press w-7 h-7 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] hidden sm:inline">
                Enter envia · Shift+Enter nova linha
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title="Entrada por voz (Fase 2)"
                className="tap-press w-8 h-8 rounded-full glass-pill flex items-center justify-center text-secondary hover:text-primary cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={!input.trim() || isTyping}
                onClick={() => sendMessage(input)}
                aria-label="Enviar mensagem"
                className="tap-press w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center disabled:opacity-35 cursor-pointer shadow-sm"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
