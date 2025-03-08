"use client"

import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"





export default function Home() {

  const [selectedPlayer,  setSelectedPlayer]  = useState("");
  const [selectedVideo,   setSelectedVideo]   = useState("");
  const [message, setMessage] = useState("");

  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);

  const [players, setPlayers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId ] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/.netlify/functions/data");
        const data = await response.json();
        if (response.ok) {
          setPlayers(data.players);
          setVideos(data.videos);
        } else {
          console.error("Failed to fetch data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Callback when the player is ready
  const onReady = (event) => {
    playerRef.current = event.target; // Store the player instance
    setCurrentTime(0); // Reset time when a new video loads
  };

  const addNote = async () => {
    const response = await fetch("/.netlify/functions/addNote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        name: selectedPlayer,
        playerId: selectedPlayerId,
        note: message,
        videoId: selectedVideoId,
        timeStamp: currentTime
     }),
    });
  
    await response.json();
    setMessage("");
  };

  useEffect(() => {

    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000); // Update every second
  
    return () => clearInterval(interval);
  }, [selectedVideoId]); // Re-run only when a new video is selected

  const opts = {
    width: "100%",
    playerVars: {
      autoplay: 0, // 1 = autoplay enabled
      controls: 1, // 1 = show controls
    },
  };
  
  return (
<div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Video Section */}
        <ResizablePanel defaultSize={75} className="flex flex-col p-4">
        <Select 
          value={selectedVideo} 
          onValueChange={(value) => {
            setSelectedVideo(value);
            const video = videos.find(v => v.name === value);
            setSelectedVideoId(video ? video.videoId : "");
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Video" />
          </SelectTrigger>
          <SelectContent>
            {videos.map((video, index) => (
              <SelectItem key={index} value={video.name}>
                {video.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

          {/* Video Container */}
          <div className="flex-1 flex justify-center items-center">
            <div className="w-full max-w-[90%] aspect-video">
            {selectedVideoId && <YouTube videoId={selectedVideoId} opts={opts} onReady={onReady} />}
            </div>
          </div>

          <p className="text-center mt-2"> Current Time: {currentTime ? currentTime.toFixed(2) : "0.00"} seconds</p>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Player Selection */}
        <ResizablePanel defaultSize={25} className="flex flex-col items-center justify-center">
        <Select value={selectedPlayer} onValueChange={(value) => {
            setSelectedPlayer(value);
            const player = players.find(p => p.name === value);
            setSelectedPlayerId(player ? player.id : "");
          }} >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Player" />
        </SelectTrigger>
        <SelectContent>
          {players.map((player) => (
            <SelectItem value={player.name}>{player.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea className={"m-5"} placeholder="Type your message here." value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button onClick={ addNote }>Submit</Button>

        </ResizablePanel>
      </ResizablePanelGroup>
    </div>

      
     
  );
}
