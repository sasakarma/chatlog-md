"use client"
import { Post } from '@/components/chatlog/post';
import { SettingsView } from '@/components/chatlog/settingsview';
import { useChatlog } from '@/hooks/usechatlog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AutosizeTextarea } from '@/components/ui/autsize-textarea';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Calendar, Hash, Move, MessageSquare, X, Settings, Download, Trash, Edit, Check } from 'lucide-react';

import MDEditor from '@uiw/react-md-editor';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function ChatlogMD() {
  const {
    posts,
    channels,
    addPost,
    handlePost,
    handleReply,
    handleEdit,
    handleDelete,
    handleAddChannel,
    handleDeleteChannel,
    toggleChannel,
    movePost,
    filteredPosts,
    newChannel, // I don't want to put these here...
    setNewChannel,
    selectedChannels,
    input,
    setInput,
    editingPost,
    setEditingPost
  } = useChatlog();

  const [showSettings, setShowSettings] = useState(false);
  // Main component logic
  return (
    <div className="max-w-4xl mx-auto p-4 grid grid-cols-4 gap-4">
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle></ModeToggle>
      </div>
      {/* channels and settings button */}
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
      
      {/* main area */}
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
              {/*
              <AutosizeTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write in Markdown..."
                maxHeight={800}
                className="min-h-24"
              />
                */}
              <MDEditor
                value = {input}
                onChange={(e) => setInput(e ?? '')}
                textareaProps={{
                  placeholder: 'Write in Markdown...'
                }}
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

}