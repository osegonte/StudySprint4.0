import { useState, useEffect, useCallback } from 'react';
import { Topic, TopicCreateData, TopicUpdateData } from '../types';
import { topicService } from '../services';

export const useTopics = (includeArchived = false) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await topicService.getTopics(includeArchived);
      setTopics(response.topics);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch topics');
      console.error('Error fetching topics:', err);
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  const createTopic = useCallback(async (data: TopicCreateData) => {
    const newTopic = await topicService.createTopic(data);
    setTopics(prev => [...prev, newTopic]);
    return newTopic;
  }, []);

  const updateTopic = useCallback(async (id: string, data: TopicUpdateData) => {
    const updatedTopic = await topicService.updateTopic(id, data);
    setTopics(prev => prev.map(topic => 
      topic.id === id ? updatedTopic : topic
    ));
    return updatedTopic;
  }, []);

  const archiveTopic = useCallback(async (id: string) => {
    await topicService.archiveTopic(id);
    setTopics(prev => prev.map(topic => 
      topic.id === id ? { ...topic, is_archived: true } : topic
    ));
  }, []);

  const restoreTopic = useCallback(async (id: string) => {
    await topicService.restoreTopic(id);
    setTopics(prev => prev.map(topic => 
      topic.id === id ? { ...topic, is_archived: false } : topic
    ));
  }, []);

  const deleteTopic = useCallback(async (id: string) => {
    await topicService.deleteTopic(id);
    setTopics(prev => prev.filter(topic => topic.id !== id));
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    loading,
    error,
    refetch: fetchTopics,
    createTopic,
    updateTopic,
    archiveTopic,
    restoreTopic,
    deleteTopic,
  };
};

export const useTopic = (id: string) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        const topicData = await topicService.getTopic(id);
        setTopic(topicData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch topic');
        console.error('Error fetching topic:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTopic();
    }
  }, [id]);

  return { topic, loading, error };
};