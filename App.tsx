
import React, { useState, useEffect } from 'react';
import { RoomState, DeviceSettings } from './types';
import Landing from './components/Landing';
import Lobby from './components/Lobby';
import Room from './components/Room';

const App: React.FC = () => {
  const [view, setView] = useState<RoomState>(RoomState.LANDING);
  const [roomName, setRoomName] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });
  const [userName, setUserName] = useState(() => localStorage.getItem('ORBIT_USER_NAME') || '');
  const [userId, setUserId] = useState(() => {
    let id = localStorage.getItem('ORBIT_USER_ID');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ORBIT_USER_ID', id);
    }
    return id;
  });
  
  const [devices, setDevices] = useState<DeviceSettings>(() => {
    const saved = localStorage.getItem('ORBIT_DEVICES');
    return saved ? JSON.parse(saved) : {
      audioInputId: 'default',
      videoInputId: 'default',
      audioOutputId: 'default',
      noiseSuppression: 'medium',
      echoCancellation: true,
      autoGainControl: true
    };
  });

  // Persist device settings
  useEffect(() => {
    localStorage.setItem('ORBIT_DEVICES', JSON.stringify(devices));
  }, [devices]);

  // Persist identity
  useEffect(() => {
    if (userName) localStorage.setItem('ORBIT_USER_NAME', userName);
  }, [userName]);

  // Handle routing persistence on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    
    if (roomParam) {
      setRoomName(roomParam);
      // If we have a username, go straight to the call, otherwise lobby
      if (userName.trim()) {
        setView(RoomState.IN_CALL);
      } else {
        setView(RoomState.LOBBY);
      }
    } else {
      setView(RoomState.LANDING);
    }
  }, [userName]);

  const handleCreateJoin = (_: string, room: string) => {
    const cleanRoom = room.trim().split('/').pop() || room;
    setRoomName(cleanRoom);
    
    const url = new URL(window.location.href);
    url.searchParams.set('room', cleanRoom);
    window.history.pushState({}, '', url.toString());

    if (userName.trim()) {
      setView(RoomState.IN_CALL);
    } else {
      setView(RoomState.LOBBY);
    }
  };

  const handleJoinCall = () => {
    if (userName.trim()) {
      setView(RoomState.IN_CALL);
    }
  };

  const handleLeave = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url.toString());
    
    setView(RoomState.LANDING);
    setRoomName('');
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
          userId={userId}
          roomName={roomName} 
          onLeave={handleLeave}
          devices={devices}
        />
      )}
    </div>
  );
};

export default App;
