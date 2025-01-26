// src/components/chatlog/Post.tsx
import { Post as PostType } from '@/types/chatlog';
import { exportPostToMd } from '@/utils/export';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Hash, Move, MessageSquare, X, Download, Trash, Edit, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { MarkdownRenderer } from './markdown-renderer';

interface PostProps {
  post: PostType;
  posts: PostType[];
  onReply: (parentId: number, content: string) => void;
  onEdit: (postId: number, content: string) => void;
  onDelete: (postId: number) => void;
  channels: string[];
  editingPost: number | null;
  setEditingPost: (postId: number | null) => void;
  movePost: (postId: number, channel: string) => void;
  depth?: number;
}

export const Post = ({post, posts = [], onReply, onEdit, onDelete, channels = [], editingPost, setEditingPost, movePost, depth = 0}: PostProps) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    
    const replies = posts.filter(p => p.replyTo == post.id);

    const handleReply = () => {
        onReply(post.id, replyContent);
        setReplyContent('');
        setIsReplying(false);
    };
    
    const handleEdit = () => {
        onEdit(post.id, editContent);
        setIsEditing(false);
    };

    
    return (
    <div className="space-y-2">
      <Card className={`p-4 space-y-2 ${depth > 0 ? 'ml-6 border-l-4 border-l-blue-500' : ''}`}>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleEdit}>
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        ) : (
           <MarkdownRenderer content={post.content}></MarkdownRenderer>
        )}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {post.date}
              {post.editedAt && (
                <span className="ml-2 text-gray-400">(edited: {post.editedAt})</span>
              )}
            </span>
            <span className="flex items-center">
              <Hash className="w-4 h-4 mr-1" />
              {post.channel}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => exportPostToMd(post)}
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(post.id)}
              title="Delete post"
            >
              <Trash className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
            {!post.replyTo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingPost(editingPost === post.id ? null : post.id)}
              >
                <Move className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        {isReplying && (
          <div className="mt-2 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              className="min-h-20"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleReply}>Reply</Button>
            </div>
          </div>
        )}

        {editingPost === post.id && (
          <div className="mt-2 space-y-2">
            <div className="text-sm">Move to channel:</div>
            <div className="flex flex-wrap gap-2">
              {channels.map(channel => (
                <Button
                  key={channel}
                  variant="outline"
                  size="sm"
                  onClick={() => movePost(post.id, channel)}
                  className={channel === post.channel ? "opacity-50 cursor-not-allowed" : ""}
                  disabled={channel === post.channel}
                >
                  {channel}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>
      {replies.length > 0 && (
        <div className="space-y-2">
          {replies.map(reply => (
            <Post
              key={reply.id}
              post={reply}
              posts={posts}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              channels={channels}
              editingPost={editingPost}
              setEditingPost={setEditingPost}
              movePost={movePost}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};