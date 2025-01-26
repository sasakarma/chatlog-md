import { useState, useEffect } from 'react';
import { Post } from '@/types/chatlog';
import { Channels } from '@/components/chatlog/channels';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, Hash, Move, MessageSquare, X, Settings, Download, Trash, Edit, Check } from 'lucide-react';


export const useChatlog = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [input, setInput] = useState('');
    const [channels, setChannels] = useState(['general']);
    const [selectedChannels, setSelectedChannels] = useState(['general']);
    const [newChannel, setNewChannel] = useState('');
    const [editingPost, setEditingPost] = useState<number | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // Load data from localStorage on initial render
    useEffect(() => {
        // Load data from localStorage
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

    const addPost = (content: string, channel: string) => {
        const newPost = {
            id: Date.now(),
            content,
            date: new Date().toLocaleString(),
            channel,
            replyTo: null,
            editedAt: null
        };
        setPosts(prev => [newPost, ...prev]);
    };

    // Add other methods (handleReply, handleEdit, handleDelete, etc.)
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

    const handleReply = (parentId: number, content: string) => {
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

    const handleEdit = (postId: number, newContent: string) => {
        setPosts(prev =>
            prev.map(post =>
                post.id === postId
                    ? { ...post, content: newContent, editedAt: new Date().toLocaleString() }
                    : post
            )
        );
    };

    const handleDelete = (postId: number) => {
        // 返信も含めて削除
        const deletePostAndReplies = (posts: Post[], postId: number) => {
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

    const handleDeleteChannel = (channelToDelete: string) => {
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

    const toggleChannel = (channel: string, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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

    const movePost = (postId: number, newChannel: string) => {
        setPosts(prev => {
            const updatePost = (post: Post) => {
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

    return {
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
        newChannel, // I dont want to add these here...
        setNewChannel,
        selectedChannels,
        setShowSettings,
        showSettings,
        input,
        setInput,
        editingPost,
        setEditingPost
        // Return other methods
    };
};