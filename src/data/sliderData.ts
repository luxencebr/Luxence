export interface Slide {
  id: number;
  src: string;
  alt: string;
}

const sliderData: Slide[] = [
  {
    id: 1,
    src: "https://www.riosexsite.com/files/banners/14092025_131650.jpg",
    alt: "Descrição da foto 1",
  },
  {
    id: 2,
    src: "/Logo VeenaSpa.png",
    alt: "Descrição da foto 2",
  },
  {
    id: 3,
    src: "https://www.riosexsite.com/files/banners/14092025_131709.jpg",
    alt: "Descrição da foto 3",
  },
];

export default sliderData;
