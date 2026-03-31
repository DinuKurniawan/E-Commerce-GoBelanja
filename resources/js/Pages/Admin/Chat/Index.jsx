import { useState, useEffect, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { FaPaperPlane, FaPaperclip, FaTimes, FaSearch } from 'react-icons/fa';

export default function Index({ auth }) {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollingInterval = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        fetchConversations();
        startPolling();
        return () => stopPolling();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages(selectedUser.id);
        }
    }, [selectedUser]);

    const startPolling = () => {
        pollingInterval.current = setInterval(() => {
            fetchConversations();
            if (selectedUser) {
                fetchMessages(selectedUser.id);
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await axios.get('/admin/chat/conversations');
            setConversations(response.data.conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/admin/chat/${userId}/messages`);
            setMessages(response.data.messages);
            
            // Mark messages as read
            await axios.patch(`/admin/chat/${userId}/mark-read`);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() && !attachment) return;
        if (!selectedUser) return;

        try {
            if (attachment) {
                const formData = new FormData();
                formData.append('attachment', attachment);
                formData.append('message', newMessage || 'Sent an attachment');

                const response = await axios.post(
                    `/admin/chat/${selectedUser.id}/attachment`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                
                setMessages([...messages, response.data.message]);
                setAttachment(null);
            } else {
                const response = await axios.post(`/admin/chat/${selectedUser.id}/reply`, {
                    message: newMessage
                });
                
                setMessages([...messages, response.data.message]);
            }
            
            setNewMessage('');
            fetchConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10240 * 1024) {
                alert('File size must be less than 10MB');
                return;
            }
            setAttachment(file);
        }
    };

    const formatTime = (date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate.toDateString() === today.toDateString()) {
            return messageDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (messageDate.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const quickReplies = [
        "Thank you for contacting us!",
        "How can I help you today?",
        "I'll look into this for you.",
        "Is there anything else I can help you with?",
        "Your order has been processed.",
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Chat Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-120px)]">
                        <div className="flex h-full">
                            {/* Conversations Sidebar */}
                            <div className="w-1/3 border-r flex flex-col bg-gray-50">
                                <div className="p-4 border-b bg-white">
                                    <h2 className="text-xl font-bold text-gray-800 mb-3">
                                        Conversations
                                    </h2>
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search conversations..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {filteredConversations.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">
                                            No conversations yet
                                        </div>
                                    ) : (
                                        filteredConversations.map((conversation) => (
                                            <div
                                                key={conversation.id}
                                                onClick={() => setSelectedUser(conversation)}
                                                className={`p-4 border-b cursor-pointer hover:bg-gray-100 transition-colors ${
                                                    selectedUser?.id === conversation.id
                                                        ? 'bg-blue-50 border-l-4 border-l-blue-600'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0">
                                                        {conversation.profile_photo_path ? (
                                                            <img
                                                                src={conversation.profile_photo_path}
                                                                alt={conversation.name}
                                                                className="w-12 h-12 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                                {conversation.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h3 className="font-semibold text-gray-800 truncate">
                                                                {conversation.name}
                                                            </h3>
                                                            <span className="text-xs text-gray-500">
                                                                {conversation.last_message_time &&
                                                                    formatTime(conversation.last_message_time)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {conversation.last_message || 'No messages yet'}
                                                        </p>
                                                        {conversation.unread_count > 0 && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                                                {conversation.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 flex flex-col">
                                {selectedUser ? (
                                    <>
                                        {/* Header */}
                                        <div className="p-4 border-b bg-white">
                                            <div className="flex items-center gap-3">
                                                {selectedUser.profile_photo_path ? (
                                                    <img
                                                        src={selectedUser.profile_photo_path}
                                                        alt={selectedUser.name}
                                                        className="w-10 h-10 rounded-full"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                                        {selectedUser.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">
                                                        {selectedUser.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {selectedUser.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                            {isLoading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full text-gray-500">
                                                    <p>No messages yet</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {messages.map((message) => (
                                                        <div
                                                            key={message.id}
                                                            className={`flex ${
                                                                message.sender_type === 'admin'
                                                                    ? 'justify-end'
                                                                    : 'justify-start'
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                                    message.sender_type === 'admin'
                                                                        ? 'bg-blue-600 text-white'
                                                                        : 'bg-white text-gray-800 border'
                                                                }`}
                                                            >
                                                                {message.attachment_url && (
                                                                    <div className="mb-2">
                                                                        {message.attachment_type?.startsWith('image/') ? (
                                                                            <img
                                                                                src={`/storage/${message.attachment_url}`}
                                                                                alt="Attachment"
                                                                                className="rounded max-w-full"
                                                                            />
                                                                        ) : (
                                                                            <a
                                                                                href={`/storage/${message.attachment_url}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="underline"
                                                                            >
                                                                                📎 View Attachment
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                )}
                                                                <p className="text-sm whitespace-pre-wrap">
                                                                    {message.message}
                                                                </p>
                                                                <p
                                                                    className={`text-xs mt-1 ${
                                                                        message.sender_type === 'admin'
                                                                            ? 'text-blue-100'
                                                                            : 'text-gray-500'
                                                                    }`}
                                                                >
                                                                    {formatTime(message.created_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div ref={messagesEndRef} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Quick Replies */}
                                        <div className="px-4 py-2 bg-gray-50 border-t">
                                            <div className="flex gap-2 overflow-x-auto">
                                                {quickReplies.map((reply, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setNewMessage(reply)}
                                                        className="px-3 py-1 bg-white border rounded-full text-sm hover:bg-gray-100 whitespace-nowrap"
                                                    >
                                                        {reply}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Input Area */}
                                        <form onSubmit={sendMessage} className="border-t p-4 bg-white">
                                            {attachment && (
                                                <div className="mb-2 p-2 bg-blue-50 rounded flex items-center justify-between">
                                                    <span className="text-sm text-blue-600">
                                                        📎 {attachment.name}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAttachment(null)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="flex items-end gap-2">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    accept="image/*,.pdf,.doc,.docx,.txt"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-gray-500 hover:text-gray-700 p-2"
                                                >
                                                    <FaPaperclip className="w-5 h-5" />
                                                </button>
                                                <textarea
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            sendMessage(e);
                                                        }
                                                    }}
                                                    placeholder="Type a message..."
                                                    rows="2"
                                                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!newMessage.trim() && !attachment}
                                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg px-6 py-2 transition-colors"
                                                >
                                                    <FaPaperPlane className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <svg
                                                className="w-24 h-24 mx-auto mb-4 text-gray-300"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                />
                                            </svg>
                                            <p className="text-lg">Select a conversation to start chatting</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
