export interface Fetishes {
  Striptease: boolean;
  Accessories: boolean;
  Costume: boolean;
  Podolatria: boolean;
  Chirophilia: boolean;
  Facefuck: boolean;
  Voyer: boolean;
  Bondage: boolean;
  Domination: boolean;
  Sadomasochism: boolean;
  Trampling: boolean;
  Fisting: boolean;
  GoldenRain: boolean;
  BrownRain: boolean;
}

export interface Offered {
  Companion: boolean;
  Trip: boolean;
  Kiss: boolean;
  Masturbation: boolean;
  OralSex: boolean;
  AnalSex: boolean;
  VaginalSex: boolean;
  OralSexWithCondom: boolean;
  AnalSexWithCondom: boolean;
  VaginalSexWithCondom: boolean;
  DoublePenetration: boolean;
  TriplePenetration: boolean;
  Squirt: boolean;

  fetishes: Fetishes;
}

export interface Services {
  mans: boolean;
  women: boolean;
  couple: boolean;
  group: boolean;

  offered: Offered;
}
