export interface Post {
  id: number;
  content: string;
  date: string;
  channel: string;
  replyTo: number | null;
  editedAt: string | null;
}