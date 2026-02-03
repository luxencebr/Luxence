export interface Post {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
  title: string;
  imageUrl?: string;
  content: string;
  views: number;
  // likes: number; // Funcionalidade desabilitada
  // comments?: Comment[]; // Funcionalidade desabilitada
}

// Interfaces comentadas - funcionalidades desabilitadas
// export interface Comment {
//   id: string;
//   userId: number;
//   postId: number;
//   comment: string;
//   likes: number;
//   createdAt: Date;
// }
