import { Sparkles } from 'lucide-react';
import { participants } from '@/constants/chatData';
import ParticipantCard from '@/components/sidebar/ParticipantCard';

export default function Sidebar() {
  return (
    <aside className="hidden w-[320px] min-h-0 flex-col gap-6 rounded-3xl border border-border bg-[#111827] p-6 xl:flex">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">AI Participants</p>
          <h2 className="text-xl font-semibold text-foreground">Room Members</h2>
        </div>
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="space-y-3">
            {participants.map((participant) => (
              <ParticipantCard key={participant.id} participant={participant} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-[#111827] p-4">
          <p className="text-sm text-muted">This room simulates multiple AI participants with unique personalities and behavior.</p>
        </div>
      </div>
    </aside>
  );
}
