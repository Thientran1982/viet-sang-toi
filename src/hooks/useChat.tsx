import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  property_id: string;
  buyer_id: string;
  seller_id: string;
}

export const useChat = (propertyId: string, sellerId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !propertyId) return;

    initializeConversation();
  }, [user, propertyId]);

  useEffect(() => {
    if (!conversation) return;

    // Fetch messages
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  const initializeConversation = async () => {
    try {
      // Check if conversation exists
      const { data: existingConv, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('property_id', propertyId)
        .eq('buyer_id', user!.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingConv) {
        setConversation(existingConv);
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            property_id: propertyId,
            buyer_id: user!.id,
            seller_id: sellerId,
          })
          .select()
          .single();

        if (createError) throw createError;
        setConversation(newConv);
      }
    } catch (error) {
      console.error('Error initializing conversation:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể khởi tạo cuộc trò chuyện',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!conversation) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (content: string) => {
    if (!conversation || !user || !content.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi tin nhắn',
        variant: 'destructive',
      });
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    isOwner: user?.id === sellerId,
  };
};
