import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import EmojiPicker from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';

interface Message {
  id: number;
  created_at: string;
  Name: string;
  ChatMessage: string;
  messageType?: 'text' | 'gif';
  gifUrl?: string;
}

// Initialize GIPHY
const gf = new GiphyFetch('36Kpjum4bW3K80k2GIlLnUDaIdcvRjOO'); // Replace with your GIPHY API key

const TeamChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchTerm, setGifSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userName, setUserName] = useState<string>('');

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch initial messages and subscribe to new ones
  useEffect(() => {
    fetchMessages();
    
    // Enable real-time updates
    const channel = supabase
      .channel('public:Team Chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Team Chat'
        },
        (payload) => {
          console.log('Real-time event received:', payload);
          const newMessage = payload.new as Message;
          
          // Only add message if it's from another user
          if (newMessage.Name !== userName) {
            console.log('Adding message from:', newMessage.Name);
            setMessages((currentMessages) => [...currentMessages, newMessage]);
            scrollToBottom();
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    // Get user name from localStorage
    const email = localStorage.getItem('userEmail') || '';
    let name;
    if (email === 'guest@gmail.com') {
      name = 'John Doe';
    } else if (email === 'rowelhal.hdc@gmail.com') {
      name = 'Rowelha Langres';
    } else if (email === 'hdc.ellainegarcia@gmail.com') {
      name = 'Ellaine Garcia';
    } else if (email === 'angelap.hdc@gmail.com') {
      name = 'Angela Pulumbarit';
    } else {
      name = localStorage.getItem('userName') || email.split('@')[0];
    }
    setUserName(name);
    console.log('Current user:', name);

    return () => {
      console.log('Cleaning up real-time subscription');
      channel.unsubscribe();
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('Team Chat')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data) {
        console.log('Fetched messages:', data);
        setMessages(data);
      }
    } catch (err: any) {
      console.error('Error fetching messages:', err.message);
      setError(err.message);
    }
  };

  // Auto-refresh messages every 0.5 seconds
  useEffect(() => {
    fetchMessages(); // Initial fetch
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent, gifUrl?: string) => {
    e.preventDefault();
    if (!newMessage.trim() && !gifUrl) return;

    try {
      const messageData = {
        Name: userName,
        ChatMessage: gifUrl ? '' : newMessage.trim(),
        messageType: (gifUrl ? 'gif' : 'text') as 'text' | 'gif',
        gifUrl: gifUrl || undefined,
        created_at: new Date().toISOString()
      };

      // Add message optimistically for sender
      const optimisticMessage: Message = {
        ...messageData,
        id: Date.now() // Temporary ID
      };
      setMessages(currentMessages => [...currentMessages, optimisticMessage]);
      scrollToBottom();

      console.log('Sending message:', messageData);
      const { data, error } = await supabase
        .from('Team Chat')
        .insert([messageData])
        .select()
        .single();

      if (error) {
        // Remove optimistic message if there's an error
        setMessages(currentMessages => 
          currentMessages.filter(msg => msg.id !== optimisticMessage.id)
        );
        throw error;
      }

      // Replace optimistic message with real one
      setMessages(currentMessages => 
        currentMessages.map(msg => 
          msg.id === optimisticMessage.id ? data : msg
        )
      );

      // Clear input and close GIF picker
      setNewMessage('');
      setShowGifPicker(false);
      console.log('Message sent successfully:', data);
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message: ' + err.message);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const onGifClick = (gif: any) => {
    sendMessage(new Event('submit') as any, gif.images.original.url);
  };

  if (error) {
    return (
      <PageTransition>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-600">
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Error loading chat: {error}</span>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="flex flex-col h-[calc(100vh-5.5rem)] p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Chat</h2>
            <p className="text-sm text-gray-500 mt-1">Communicate with your team in real-time</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>
        
        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col border border-gray-100">
          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-1">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation with your team!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.Name === userName ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex flex-col ${message.Name === userName ? 'items-end' : 'items-start'} min-w-0 max-w-[70%]`}>
                      {/* Header: Name and Time */}
                      <div className={`flex items-center gap-2 mb-1 ${message.Name === userName ? 'flex-row-reverse pr-10' : 'flex-row pl-10'}`}>
                        <span className="text-sm font-medium text-gray-700">
                          {message.Name === 'guest@gmail.com' ? 'John Doe' : 
                           message.Name === 'rowelhal.hdc@gmail.com' ? 'Rowelha Langres' :
                           message.Name === 'hdc.ellainegarcia@gmail.com' ? 'Ellaine Garcia' :
                           message.Name === 'angelap.hdc@gmail.com' ? 'Angela Pulumbarit' :
                           message.Name}
                        </span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
                      </div>

                      {/* Message with Badge */}
                      <div className={`flex items-start gap-2 ${message.Name === userName ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
                          message.Name === userName 
                            ? 'from-purple-500 to-indigo-600' 
                            : 'from-purple-500 to-indigo-600'
                        } flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                          {message.Name.charAt(0).toUpperCase()}
                        </div>
                        <div className={`rounded-2xl px-4 py-2 shadow-sm flex-grow ${
                          message.Name === userName 
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white max-w-fit' 
                            : 'bg-white border border-gray-100'
                        }`}>
                          {message.messageType === 'gif' ? (
                            <img 
                              src={message.gifUrl} 
                              alt="GIF" 
                              className="rounded-lg max-w-[300px] max-h-[300px] object-contain"
                            />
                          ) : (
                            <p className={`text-sm whitespace-pre-wrap break-words ${message.Name === userName ? 'text-white' : 'text-gray-700'}`}>
                              {message.ChatMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 p-4 bg-white">
            <form onSubmit={(e) => sendMessage(e)} className="flex flex-col">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newMessage.trim()) {
                        sendMessage(e);
                      }
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full pl-4 pr-24 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow text-sm"
                />
                <div className="absolute right-3 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker(!showGifPicker);
                      setShowEmojiPicker(false);
                    }}
                    className="text-gray-400 hover:text-purple-500 transition-colors"
                    title="Add GIF"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setShowGifPicker(false);
                    }}
                    className="text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-10">
                  <div className="shadow-lg rounded-lg">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </div>
                </div>
              )}
              {showGifPicker && (
                <div className="absolute bottom-20 right-4 z-10 bg-white rounded-lg shadow-lg p-4 w-[320px]">
                  <div className="mb-4">
                    <input
                      type="text"
                      value={gifSearchTerm}
                      onChange={(e) => setGifSearchTerm(e.target.value)}
                      placeholder="Search GIFs..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div className="h-[300px] overflow-y-auto bg-white rounded-lg w-[280px]">
                    <div className="giphy-grid [&_img]:rounded-lg [&_img]:cursor-pointer [&_img]:transition-transform hover:[&_img]:scale-105">
                      <Grid
                        onGifClick={onGifClick}
                        fetchGifs={(offset: number) =>
                          gifSearchTerm
                            ? gf.search(gifSearchTerm, { offset, limit: 10 })
                            : gf.trending({ offset, limit: 10 })
                        }
                        width={280}
                        columns={2}
                        gutter={6}
                        key={gifSearchTerm}
                        noLink={true}
                        hideAttribution={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default TeamChatPage;
