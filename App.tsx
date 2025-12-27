
import React, { useState } from 'react';
import { RoomState, DeviceSettings } from './types';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import Room from './components/Room';

const App: React.FC = () => {
  const [view, setView] = useState<RoomState>(RoomState.LANDING);
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [devices, setDevices] = useState<DeviceSettings>({
    audioInputId: 'default',
    videoInputId: 'default',
    audioOutputId: 'default'
  });

  const handleCreateJoin = (_: string, room: string) => {
    // We ignore the initial name as it's now collected in the Lobby
    setRoomName(room);
    setView(RoomState.LOBBY);
  };

  const handleJoinCall = () => {
    if (userName.trim()) {
      setView(RoomState.IN_CALL);
    }
  };

  const handleLeave = () => {
    setView(RoomState.LANDING);
    setRoomName('');
    setUserName('');
  };

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {view === RoomState.LANDING && (
        <Landing onStart={handleCreateJoin} />
      )}
      {view === RoomState.LOBBY && (
        <Lobby 
          userName={userName} 
          setUserName={setUserName}
          roomName={roomName} 
          onJoin={handleJoinCall} 
          onCancel={() => setView(RoomState.LANDING)}
          devices={devices}
          setDevices={setDevices}
        />
      )}
      {view === RoomState.IN_CALL && (
        <Room 
          userName={userName} 
          roomName={roomName} 
          onLeave={handleLeave}
          devices={devices}
        />
      )}
    </div>
  );
};

export default App;
