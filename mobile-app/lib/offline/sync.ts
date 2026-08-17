import { supabase } from '../supabase';
import { getQueue, removeFromQueue } from './queue';

export async function syncQueue(onProgress?: (synced: number, total: number) => void) {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const action of queue) {
    const table = action.type === 'risk_assessment' ? 'risk_assessments' : 'incident_reports';
    const { error } = await supabase.from(table).insert(action.payload);

    if (!error) {
      await removeFromQueue(action.id);
      synced++;
    } else {
      failed++;
    }
    onProgress?.(synced, queue.length);
  }

  return { synced, failed };
}