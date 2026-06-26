'use client';

import { useEffect, useState } from 'react';
import { multiRoomChatSystem } from '@/services/multiRoomChatSystem';

export function MultiRoomChatUI() {
  const [rooms, setRooms] = useState(multiRoomChatSystem.getAllRooms());
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    // Load initial rooms (may have been persisted)
    setRooms(multiRoomChatSystem.getAllRooms());
  }, []);

  const refreshRooms = () => setRooms(multiRoomChatSystem.getAllRooms());

  const handleCreateRoom = () => {
    if (!newRoomName.trim()) return;

    const room = multiRoomChatSystem.createRoom(newRoomName);
    multiRoomChatSystem.switchRoom(room.id);
    refreshRooms();
    setNewRoomName('');
    setShowCreateRoom(false);
  };

  const handleSwitchRoom = (roomId) => {
    multiRoomChatSystem.switchRoom(roomId);
    refreshRooms();
  };

  const handleDeleteRoom = (roomId) => {
    multiRoomChatSystem.deleteRoom(roomId);
    refreshRooms();
  };

  const currentRoom = multiRoomChatSystem.getCurrentRoom();

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Room Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => handleSwitchRoom(room.id)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap transition ${currentRoom?.id === room.id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
          >
            {room.name}
            <span className="ml-2 text-xs text-slate-400">
              ({room.metadata.messageCount})
            </span>
          </button>
        ))}

        {/* Create Room Button */}
        <button
          onClick={() => setShowCreateRoom(true)}
          className="px-3 py-1 rounded text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 whitespace-nowrap"
        >
          + New
        </button>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-4 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Room</h3>

            <input
              type="text"
              placeholder="Room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
              className="w-full px-3 py-2 bg-slate-700 rounded border border-slate-600 text-white placeholder-slate-400 mb-4 focus:outline-none focus:border-blue-500"
              autoFocus
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateRoom(false);
                  setNewRoomName('');
                }}
                className="px-4 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Info */}
      {currentRoom && (
        <div className="bg-slate-800 rounded-lg p-3 text-xs">
          <p className="text-slate-400">
            Created: {new Date(currentRoom.createdAt).toLocaleDateString()}
          </p>
          <p className="text-slate-400">
            Participants: {currentRoom.participants.join(', ')}
          </p>
          <p className="text-slate-400">
            Messages: {currentRoom.metadata.messageCount}
          </p>
        </div>
      )}
    </div>
  );
}
