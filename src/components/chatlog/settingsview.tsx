// src/components/chatlog/SettingsView.tsx
import { Post } from '@/types/chatlog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Calendar, Hash, Move, MessageSquare, X, Settings, Download, Trash, Edit, Check } from 'lucide-react';


interface SettingsViewProps {
  posts: Post[];
  channels: string[];
  onDeleteChannel: (channel: string) => void;
  onClose: () => void;
}

export const SettingsView = ({ posts = [], channels = [], onDeleteChannel, onClose }: SettingsViewProps) => {
  // Settings component logic
  const exportAllData = () => {
    const data = JSON.stringify({ posts, channels }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chatlog-md-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };
  const [channelToDelete, setChannelToDelete] = useState<string|null>(null);

  const handleDeleteChannel = (channel:string|null) => {
    setChannelToDelete(channel);
  };

  const confirmDeleteChannel = () => {
    if (channelToDelete) {
      onDeleteChannel(channelToDelete);
      setChannelToDelete(null);
    }
  };

  const postsInChannel = (channel:string|null) => {
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