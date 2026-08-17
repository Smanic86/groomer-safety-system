import AsyncStorage from '@react-native-async-storage/async-storage';

export type QueuedAction = {
  id: string;
  type: 'risk_assessment' | 'incident_report';
  payload: Record<string, any>;
  createdAt: string;
};

const QUEUE_KEY = 'offline_action_queue';

export async function addToQueue(action: Omit<QueuedAction, 'id' | 'createdAt'>) {
  const queue = await getQueue();
  const newAction: QueuedAction = {
    ...action,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  queue.push(newAction);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  return newAction;
}

export async function getQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeFromQueue(id: string) {
  const queue = await getQueue();
  const filtered = queue.filter((a) => a.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
}

export async function getQueueCount(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}