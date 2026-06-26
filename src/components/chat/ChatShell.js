import Sidebar from '@/components/sidebar/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatShell() {
  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto flex h-screen max-h-screen max-w-[1600px] gap-4 px-4 py-6 xl:px-8">
        <Sidebar />
        <div className="min-h-0 flex-1">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
}
