export interface Post {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  publishedAt: Date;
  title: string;
  image?: Array<{ url: string }>;
  content: string;

  views: number;
  likes?: number;

  comments?: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;

  content: string;
  likes?: number;
  createdAt?: string;
}
