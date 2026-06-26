import Dexie from 'dexie';
import { schema } from '@/storage/db/schema';

export const db = new Dexie('ai-group-chat');
// Bump DB version to include new stores (memories, analytics, sessions)
db.version(2).stores(schema);
