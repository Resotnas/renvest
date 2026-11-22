import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AiAnalysisResult,
  ChatMessage,
  InvestorProfile,
  PortfolioAsset,
  PortfolioSnapshot,
  UserProfile,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('seu-projeto') &&
    !supabaseAnonKey.includes('sua-chave')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('name, email, investor_profile, onboarding_completed')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return {
    name: data.name,
    email: data.email || '',
    investorProfile: data.investor_profile as InvestorProfile,
    onboardingCompleted: Boolean(data.onboarding_completed),
  };
}

export async function upsertUserProfile(userId: string, profile: Partial<UserProfile>) {
  if (!supabase) return;
  await supabase.from('profiles').upsert({
    id: userId,
    ...(profile.name !== undefined ? { name: profile.name } : {}),
    ...(profile.email !== undefined ? { email: profile.email } : {}),
    ...(profile.investorProfile !== undefined
      ? { investor_profile: profile.investorProfile }
      : {}),
    ...(profile.onboardingCompleted !== undefined
      ? { onboarding_completed: profile.onboardingCompleted }
      : {}),
    updated_at: new Date().toISOString(),
  });
}

export async function fetchUserPortfolio(userId: string): Promise<PortfolioAsset[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('portfolio_assets')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    institution: row.institution,
    investedValue: Number(row.invested_value),
    currentValue: Number(row.current_value),
    updatedAt: new Date(row.updated_at).toLocaleDateString('pt-BR'),
  }));
}

export async function insertPortfolioAsset(
  userId: string,
  asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>
): Promise<PortfolioAsset | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('portfolio_assets')
    .insert({
      user_id: userId,
      category: asset.category,
      name: asset.name,
      institution: asset.institution,
      invested_value: asset.investedValue,
      current_value: asset.currentValue,
    })
    .select()
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    category: data.category,
    name: data.name,
    institution: data.institution,
    investedValue: Number(data.invested_value),
    currentValue: Number(data.current_value),
    updatedAt: new Date(data.updated_at).toLocaleDateString('pt-BR'),
  };
}

export async function updatePortfolioAssetDb(
  userId: string,
  id: string,
  asset: Omit<PortfolioAsset, 'id' | 'updatedAt'>
) {
  if (!supabase) return;
  await supabase
    .from('portfolio_assets')
    .update({
      category: asset.category,
      name: asset.name,
      institution: asset.institution,
      invested_value: asset.investedValue,
      current_value: asset.currentValue,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId);
}

export async function deletePortfolioAssetDb(userId: string, id: string) {
  if (!supabase) return;
  await supabase.from('portfolio_assets').delete().eq('id', id).eq('user_id', userId);
}

export async function fetchPortfolioSnapshots(userId: string): Promise<PortfolioSnapshot[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('portfolio_snapshots')
    .select('label, invested_total, current_total')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: true })
    .limit(12);
  if (error || !data) return [];
  return data.map((row) => ({
    date: row.label,
    invested: Number(row.invested_total),
    current: Number(row.current_total),
  }));
}

export async function insertPortfolioSnapshot(
  userId: string,
  snapshot: PortfolioSnapshot
) {
  if (!supabase) return;
  await supabase.from('portfolio_snapshots').insert({
    user_id: userId,
    label: snapshot.date,
    invested_total: snapshot.invested,
    current_total: snapshot.current,
  });
}

export async function fetchUserAiAnalyses(userId: string): Promise<AiAnalysisResult[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('ai_analyses')
    .select('id, payload, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error || !data) return [];
  return data.map((row) => ({
    ...(row.payload as AiAnalysisResult),
    id: row.id,
  }));
}

export async function insertUserAiAnalysis(
  userId: string,
  analysis: AiAnalysisResult
): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('ai_analyses')
    .insert({
      user_id: userId,
      mode: analysis.mode,
      amount: analysis.amount,
      investor_profile: analysis.investorProfile,
      title: analysis.title,
      summary: analysis.summary,
      payload: analysis,
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return data.id;
}

export async function deleteUserAiAnalysis(userId: string, id: string) {
  if (!supabase) return;
  await supabase.from('ai_analyses').delete().eq('id', id).eq('user_id', userId);
}

export async function fetchUserChatMessages(userId: string): Promise<ChatMessage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(60);
  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    timestamp: new Date(row.created_at).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
}

export async function insertUserChatMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string
) {
  if (!supabase) return;
  await supabase.from('chat_messages').insert({
    user_id: userId,
    role,
    content,
  });
}

export async function clearUserChatMessages(userId: string) {
  if (!supabase) return;
  await supabase.from('chat_messages').delete().eq('user_id', userId);
}
