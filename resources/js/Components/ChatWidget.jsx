import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';
import { FaComments, FaTimes, FaMinus, FaPaperPlane, FaPaperclip, FaSmile } from 'react-icons/fa';
import { IoLogoWhatsapp } from 'react-icons/io';

export default function ChatWidget() {
    const { storeSettings } = usePage().props;
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollingInterval = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            startPolling();
        } else {
            stopPolling();
        }
        return () => stopPolling();
    }, [isOpen]);

    const startPolling = () => {
        pollingInterval.current = setInterval(() => {
            checkNewMessages();
        }, 5000);
    };

    const stopPolling = () => {
        if (pollingInterval.current) {
            clearInterval(pollingInterval.current);
        }
    };

    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('/user/chat');
            setMessages(response.data.messages);
            setUnreadCount(response.data.unreadCount);
            
            // Mark messages as read
            if (response.data.unreadCount > 0) {
                await axios.patch('/user/chat/read-all');
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkNewMessages = async () => {
        try {
            const response = await axios.get('/user/chat/check');
            if (response.data.hasNewMessages && !isOpen) {
                setUnreadCount(response.data.unreadCount);
                
                // Show browser notification
                if (Notification.permission === 'granted') {
                    new Notification('New message from Admin', {
                        body: 'You have a new message in the chat',
                        icon: '/favicon.ico'
                    });
                }
            } else if (response.data.hasNewMessages && isOpen && !isMinimized) {
                fetchMessages();
            }
        } catch (error) {
            console.error('Error checking messages:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        
        if (!newMessage.trim() && !attachment) return;

        try {
            if (attachment) {
                const formData = new FormData();
                formData.append('attachment', attachment);
                formData.append('message', newMessage || 'Sent an attachment');

                const response = await axios.post('/user/chat/attachment', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                setMessages([...messages, response.data.message]);
                setAttachment(null);
            } else {
                const response = await axios.post('/user/chat/send', {
                    message: newMessage
                });
                
                setMessages([...messages, response.data.message]);
            }
            
            setNewMessage('');
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

    const toggleChat = () => {
        if (isOpen) {
            setIsOpen(false);
            setIsMinimized(false);
        } else {
            setIsOpen(true);
            setIsMinimized(false);
            
            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }
        }
    };

    const openWhatsApp = () => {
        const message = encodeURIComponent("Hi, I need help with...");
        const phoneNumber = storeSettings?.whatsapp_number || "1234567890";
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* Chat Widget Button */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                {/* WhatsApp Button */}
                <button
                    onClick={openWhatsApp}
                    className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
                    title="Contact us on WhatsApp"
                >
                    <IoLogoWhatsapp className="w-6 h-6" />
                </button>

                {/* Chat Button */}
                <button
                    onClick={toggleChat}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 relative"
                >
                    <FaComments className="w-6 h-6" />
                    {unreadCount > 0 && !isOpen && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div
                    className={`fixed bottom-24 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
                        isMinimized ? 'h-14' : 'h-[600px]'
                    }`}
                >
                    {/* Header */}
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <div>
                                <h3 className="font-semibold">Customer Support</h3>
                                <p className="text-xs opacity-90">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hover:bg-blue-700 p-1 rounded"
                            >
                                <FaMinus className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleChat}
                                className="hover:bg-blue-700 p-1 rounded"
                            >
                                <FaTimes className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Messages */}
                            <div className="h-[460px] overflow-y-auto p-4 bg-gray-50">
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <FaComments className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Start a conversation!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    message.sender_type === 'user'
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                                        message.sender_type === 'user'
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
                                                    <p className="text-sm">{message.message}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            message.sender_type === 'user'
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

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border rounded-lg px-4 py-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Input Area */}
                            <form onSubmit={sendMessage} className="border-t p-3">
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
                                <div className="flex items-center gap-2">
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
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() && !attachment}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full p-2 transition-colors"
                                    >
                                        <FaPaperPlane className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
