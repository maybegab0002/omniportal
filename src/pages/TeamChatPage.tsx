import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import PageTransition from '../components/PageTransition';
import EmojiPicker from 'emoji-picker-react';

interface Message {
  id: number;
  created_at: string;
  Name: string;
  ChatMessage: string;
}

const TeamChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
      .channel('team-chat-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Team Chat'
        },
        (payload) => {
          console.log('Real-time event received:', payload);
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            console.log('Adding new message to state:', newMessage);
            setMessages((currentMessages) => [...(currentMessages || []), newMessage]);
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
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const newMessageData = {
        Name: userName,
        ChatMessage: newMessage.trim(),
        created_at: new Date().toISOString()
      };

      console.log('Sending message:', newMessageData);
      const { error } = await supabase
        .from('Team Chat')
        .insert([newMessageData]);

      if (error) throw error;
      
      // Update messages state immediately
      setMessages(currentMessages => [...(currentMessages || []), { ...newMessageData, id: Date.now() }]);
      setNewMessage('');
      console.log('Message sent and state updated');
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
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
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
                          <p className={`text-sm whitespace-pre-wrap break-words ${message.Name === userName ? 'text-white' : 'text-gray-700'}`}>
                            {message.ChatMessage}
                          </p>
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
            <form onSubmit={sendMessage} className="flex flex-col">
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
                  className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 text-gray-400 hover:text-purple-500 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-10">
                  <div className="shadow-lg rounded-lg">
                    <EmojiPicker onEmojiClick={onEmojiClick} />
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
