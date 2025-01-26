// src/utils/export.ts
import { Post } from '@/types/chatlog';
export const exportPostToMd = (post: Post) => {
  const metadata = `---
date: ${post.date}
channel: ${post.channel}
---

`;
  const fileName = `post-${post.id}.md`;
  const content = metadata + post.content;
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
};