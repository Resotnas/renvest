import { InvestorProfile } from '../types';

export interface OnboardingOption {
  label: string;
  description: string;
  score: number; // 1 = conservador, 2 = moderado, 3 = arrojado
}

export interface OnboardingQuestion {
  id: number;
  title: string;
  subtitle: string;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 1,
    title: 'Qual é o seu principal objetivo ao investir?',
    subtitle: 'Isso define o equilíbrio entre segurança e crescimento.',
    options: [
      {
        label: 'Preservar meu patrimônio',
        description: 'Priorizo segurança, liquidez e previsibilidade acima de tudo.',
        score: 1,
      },
      {
        label: 'Equilíbrio + Renda Passiva',
        description: 'Quero proteção com renda mensal de FIIs e crescimento gradual.',
        score: 2,
      },
      {
        label: 'Multiplicar capital no longo prazo',
        description: 'Aceito oscilações no curto prazo buscando retornos maiores.',
        score: 3,
      },
    ],
  },
  {
    id: 2,
    title: 'Por quanto tempo pretende deixar esse dinheiro investido?',
    subtitle: 'O horizonte de tempo impacta a exposição ideal em renda variável.',
    options: [
      {
        label: 'Menos de 2 anos',
        description: 'Posso precisar resgatar esse valor no curto prazo.',
        score: 1,
      },
      {
        label: 'De 2 a 5 anos',
        description: 'Tenho planos de médio prazo, mas com certa flexibilidade.',
        score: 2,
      },
      {
        label: 'Mais de 5 anos',
        description: 'Foco em independência financeira e acúmulo de longo prazo.',
        score: 3,
      },
    ],
  },
  {
    id: 3,
    title: 'Se sua carteira caísse 15% em um mês, o que você faria?',
    subtitle: 'Mede sua tolerância emocional à volatilidade do mercado.',
    options: [
      {
        label: 'Resgataria para evitar mais perdas',
        description: 'Não me sinto confortável vendo meu saldo negativo.',
        score: 1,
      },
      {
        label: 'Manteria a calma e aguardaria',
        description: 'Entendo que oscilações acontecem, mas não compraria mais agora.',
        score: 2,
      },
      {
        label: 'Aproveitaria para aportar mais',
        description: 'Vejo quedas em bons ativos como oportunidade de desconto.',
        score: 3,
      },
    ],
  },
  {
    id: 4,
    title: 'Qual é sua experiência atual com investimentos?',
    subtitle: 'Personaliza o nível das sugestões da IA RenVest.',
    options: [
      {
        label: 'Iniciante',
        description: 'Conheço poupança, CDBs ou Tesouro Selic.',
        score: 1,
      },
      {
        label: 'Intermediário',
        description: 'Já invisto em Renda Fixa e acompanho FIIs ou algumas Ações.',
        score: 2,
      },
      {
        label: 'Experiente',
        description: 'Analiso múltiplos, dividendos e balanceamento de carteira.',
        score: 3,
      },
    ],
  },
  {
    id: 5,
    title: 'Você já possui uma reserva de emergência formada?',
    subtitle: 'Recomendamos 6 meses de gastos em liquidez diária antes de arriscar.',
    options: [
      {
        label: 'Ainda estou construindo',
        description: 'Preciso fortalecer minha reserva em Tesouro Selic / CDB diário.',
        score: 1,
      },
      {
        label: 'Tenho parcialmente (3 a 5 meses)',
        description: 'Já tenho uma base, mas ainda reforço parte dela.',
        score: 2,
      },
      {
        label: 'Sim, reserva 100% completa',
        description: 'Estou pronto para diversificar buscando maior rentabilidade.',
        score: 3,
      },
    ],
  },
];

export function calculateInvestorProfile(scores: number[]): InvestorProfile {
  const total = scores.reduce((acc, v) => acc + v, 0);
  if (total <= 8) return 'Conservador';
  if (total <= 12) return 'Moderado';
  return 'Arrojado';
}
