export interface ProducerAppearance {
  Altura: number;
  Manequim: number;
  Pés: number;

  Etnia: "Branca" | "Parda" | "Morena" | "Preta" | "Indígena" | "Oriental";
  Cabelo:
    | "Loiro"
    | "Preto"
    | "Ruivo"
    | "Castanho"
    | "Colorido"
    | "Grisalho"
    | "Sem Cabelo";
  Olhos: "Azuis" | "Castanhos" | "Verdes" | "Pretos";

  Tatuagens: boolean;
  Piercings: boolean;
  Silicone: boolean;
}
