// data/plans.ts
export interface Plan {
  id: number;
  title: string;
  price: string;
  description: string;
  benefits: string[];
}

export const plans: Plan[] = [
  {
    id: 1,
    title: "Silver",
    price: "R$29,90/mês",
    description: "Perfeito para quem está começando",
    benefits: ["Acesso limitado", "Suporte básico", "Atualizações mensais"],
  },
  {
    id: 2,
    title: "Gold",
    price: "R$59,90/mês",
    description: "Ideal para quem quer investir",
    benefits: [
      "Acesso completo",
      "Suporte prioritário",
      "Atualizações semanais",
    ],
  },
  {
    id: 3,
    title: "Diamond",
    price: "R$99,90/mês",
    description: "Para grandes nomes",
    benefits: ["Todos os recursos", "Suporte dedicado", "Atualizações diárias"],
  },
];
