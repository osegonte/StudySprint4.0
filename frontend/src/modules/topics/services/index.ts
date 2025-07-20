import axios from 'axios';
import { Topic, TopicCreateData, TopicUpdateData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class TopicService {
  private baseURL = `${API_URL}/api/v1`;

  async getTopics(includeArchived = false): Promise<{
    topics: Topic[];
    total: number;
    archived_count: number;
  }> {
    const response = await axios.get(`${this.baseURL}/topics`, {
      params: { include_archived: includeArchived },
    });
    return response.data;
  }

  async getTopic(id: string): Promise<Topic> {
    const response = await axios.get(`${this.baseURL}/topics/${id}`);
    return response.data;
  }

  async createTopic(data: TopicCreateData): Promise<Topic> {
    const response = await axios.post(`${this.baseURL}/topics`, data);
    return response.data;
  }

  async updateTopic(id: string, data: TopicUpdateData): Promise<Topic> {
    const response = await axios.put(`${this.baseURL}/topics/${id}`, data);
    return response.data;
  }

  async archiveTopic(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/topics/${id}/archive`);
  }

  async restoreTopic(id: string): Promise<void> {
    await axios.post(`${this.baseURL}/topics/${id}/restore`);
  }

  async deleteTopic(id: string): Promise<void> {
    await axios.delete(`${this.baseURL}/topics/${id}`);
  }

  async getTopicHierarchy(): Promise<Topic[]> {
    const response = await axios.get(`${this.baseURL}/topics/hierarchy`);
    return response.data;
  }
}

export const topicService = new TopicService();