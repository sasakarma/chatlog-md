"use client";
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css' // `rehype-katex` does not import the CSS for you

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, Hash, Move, MessageSquare, X, Settings, Download, Trash, Edit, Check } from 'lucide-react';
import { channel } from 'diagnostics_channel';

const Post = ({ post, posts = [], onReply, onEdit, onDelete, channels = [], editingPost, setEditingPost, movePost, depth = 0 }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const replies = posts.filter(p => p.replyTo === post.id);

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
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{post.content}</ReactMarkdown>
          </div>
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

const SettingsView = ({ posts = [], channels = [], onDeleteChannel, onClose }) => {
  const exportAllData = () => {
    const data = JSON.stringify({ posts, channels }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatlog-md-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };
  const [channelToDelete, setChannelToDelete] = useState(null);

  const handleDeleteChannel = (channel) => {
    setChannelToDelete(channel);
  };

  const confirmDeleteChannel = () => {
    if (channelToDelete) {
      onDeleteChannel(channelToDelete);
      setChannelToDelete(null);
    }
  };

  const postsInChannel = (channel) => {
    return posts.filter(post => post.channel === channel).length;
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Settings</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
        <h3 className="text-lg font-semibold mb-2">Channel Management</h3>
        <div className="space-y-2">
          {channels.map(channel => (
            <div key={channel} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <span className="font-medium">{channel}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {postsInChannel(channel)} posts
                </span>
              </div>
              {channel !== 'general' && (
                channelToDelete === channel ? (
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={confirmDeleteChannel}>
                      Confirm
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setChannelToDelete(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteChannel(channel)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )
              )}
            </div>
          ))}
          </div>
        </div>

        <h3 className="text-lg font-semibold mb-2">Backup and Export</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Export all your data including posts, replies, and channel settings as a JSON file.
          </p>
          <Button onClick={exportAllData}>
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Statistics</h3>
          <div className="space-y-1 text-sm">
            <p>Total Posts: {posts.length}</p>
            <p>Total Channels: {channels.length}</p>
            <p>Total Replies: {posts.filter(p => p.replyTo).length}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const exportPostToMd = (post) => {
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

const ChatlogMD = () => {
  const [posts, setPosts] = useState([]);
  const [input, setInput] = useState('');
  const [channels, setChannels] = useState(['general']);
  const [selectedChannels, setSelectedChannels] = useState(['general']);
  const [newChannel, setNewChannel] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedPosts = localStorage.getItem('chatlogmd-posts');
    const savedChannels = localStorage.getItem('chatlogmd-channels');
    
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
    
    if (savedChannels) {
      const parsedChannels = JSON.parse(savedChannels);
      setChannels(parsedChannels);
      if (!parsedChannels.includes('general')) {
        setChannels(prev => ['general', ...prev]);
      }
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatlogmd-posts', JSON.stringify(posts));
  }, [posts]);

  // Save channels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatlogmd-channels', JSON.stringify(channels));
  }, [channels]);

  const handlePost = () => {
    if (!input.trim()) return;
    const newPost = {
      id: Date.now(),
      content: input,
      date: new Date().toLocaleString(),
      channel: selectedChannels[0],
      replyTo: null,
      editedAt: null
    };
    setPosts([newPost, ...posts]);
    setInput('');
  };

  const handleReply = (parentId, content) => {
    if (!content.trim()) return;
    const parentPost = posts.find(p => p.id === parentId);
    const newReply = {
      id: Date.now(),
      content,
      date: new Date().toLocaleString(),
      channel: parentPost.channel,
      replyTo: parentId,
      editedAt: null
    };
    setPosts([newReply, ...posts]);
  };

  const handleEdit = (postId, newContent) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, content: newContent, editedAt: new Date().toLocaleString() }
          : post
      )
    );
  };

  const handleDelete = (postId) => {
    // 返信も含めて削除
    const deletePostAndReplies = (posts, postId) => {
      const repliesIds = posts
        .filter(p => p.replyTo === postId)
        .map(p => p.id);
      
      // 再帰的に返信を削除
      repliesIds.forEach(replyId => {
        deletePostAndReplies(posts, replyId);
      });

      setPosts(prev => prev.filter(p => p.id !== postId && p.replyTo !== postId));
    };

    deletePostAndReplies(posts, postId);
  };

  const handleAddChannel = () => {
    if (!newChannel.trim() || channels.includes(newChannel)) return;
    setChannels([...channels, newChannel]);
    setNewChannel('');
  };

  const handleDeleteChannel = (channelToDelete) => {
    if (channelToDelete === 'general') return;
    
    // 削除するチャンネルの投稿を general に移動
    setPosts(prev =>
      prev.map(post =>
        post.channel === channelToDelete
          ? { ...post, channel: 'general' }
          : post
      )
    );

    // チャンネルを削除
    setChannels(prev => prev.filter(ch => ch !== channelToDelete));
    
    // 選択中のチャンネルから削除
    setSelectedChannels(prev => 
      prev.filter(ch => ch !== channelToDelete)
    );
  };

  const toggleChannel = (channel, event) => {
    setSelectedChannels(prev => {
      // Shift key が押されている場合は複数選択可能
      if (event.shiftKey) {
        return prev.includes(channel)
          ? prev.filter(ch => ch !== channel)
          : [...prev, channel];
      }
      // Shift key が押されていない場合は単一選択
      return [channel];
    });
  };

  const movePost = (postId, newChannel) => {
    setPosts(prev => {
      const updatePost = (post) => {
        if (post.id === postId) {
          return { ...post, channel: newChannel };
        }
        return post;
      };
      
      return prev.map(post => {
        const updatedPost = updatePost(post);
        if (post.replyTo === postId) {
          return { ...updatedPost, channel: newChannel };
        }
        return updatedPost;
      });
    });
    setEditingPost(null);
  };

  const filteredPosts = posts.filter(post => 
    selectedChannels.includes(post.channel) && !post.replyTo
  );

  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-4 gap-4">
      <div className="col-span-1 flex flex-col h-[calc(100vh-2rem)]">
        <div className="flex-grow space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                placeholder="New channel"
              />
              <Button onClick={handleAddChannel}>Add</Button>
            </div>
            <div className="space-y-1">
              {channels.map(channel => (
                <Button
                  key={channel}
                  variant={selectedChannels.includes(channel) ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={(e) => toggleChannel(channel, e)}
                >
                  <Hash className="w-4 h-4 mr-2" />
                  {channel}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start mt-4"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <div className="col-span-3 space-y-4">
        {showSettings ? (
          <SettingsView
            posts={posts}
            channels={channels}
            onClose={() => setShowSettings(false)}
            onDeleteChannel={handleDeleteChannel}
          />
        ) : (
          <>
            <div className="space-y-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write in Markdown..."
                className="min-h-24"
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Posting to: #{selectedChannels[0]}
                </div>
                <Button onClick={handlePost}>Post</Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredPosts.map(post => (
                <Post
                  key={post.id}
                  post={post}
                  posts={posts}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  channels={channels}
                  editingPost={editingPost}
                  setEditingPost={setEditingPost}
                  movePost={movePost}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatlogMD;
