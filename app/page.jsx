"use client";

import { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


import { ScrollArea } from "@/components/ui/scroll-area"


export default function Home() {
  const [players, setPlayers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  const playerRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`; // Ensures two-digit seconds
  };

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

  useEffect(() => {
    if (selectedPlayerId && selectedVideoId) {
    const fetchData = async () => {
      try {
        const response = await fetch("/.netlify/functions/getNotes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            playerId: selectedPlayerId,
            videoId: selectedVideoId
         }),
        });
        const data = await response.json();
        if (response.ok) {
          console.log(data)
          setNotes(data.notes)
        } else {
          console.error("Failed to fetch data:", data.error);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    }
  }, [selectedVideoId, selectedPlayer]);

  const onReady = (event) => {
    playerRef.current = event.target; // Store the player instance
  };

  const seek = (time) => {
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(time, true); // 'true' allows seeking ahead
    }
  };

  const opts = {
    height: "360",
    width: "640",
    playerVars: {
      autoplay: 0, // 1 = autoplay enabled
      controls: 1, // 1 = show controls
    },
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen  pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-row items-center justify-center gap-4">
        {/* Player Select */}
        <Select value={selectedPlayer} onValueChange={(value) => {
            setSelectedPlayer(value);
            const player = players.find(p => p.name === value);
            setSelectedPlayerId(player ? player.id : "");
          }} >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Player" />
          </SelectTrigger>
          <SelectContent>
            {players.map((player, index) => (
              <SelectItem key={index} value={player.name}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Video Select */}
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
      </div>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Panel - Video Section */}
        <ResizablePanel defaultSize={75} className="flex flex-col p-4">

        {/* YouTube Player */}
        {selectedVideoId && <YouTube videoId={selectedVideoId} opts={opts} onReady={onReady}/>}
        </ResizablePanel>


        <ResizablePanel defaultSize={25} className="flex flex-col items-center justify-center">
          <ScrollArea className="h-100 w-full flex flex-col items-center rounded-md border">
          <div className="p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Notes</h4>
            {[...notes]
              .sort((a, b) => a.timeStamp - b.timeStamp).map((note, i) => (
              <Card key={i} onClick={() => seek(note.timeStamp)} className="w-[100%] max-w my-2">
                <CardDescription className="px-4">
                  {formatTime(note.timeStamp)}
                </CardDescription>
                <CardContent className="px-4 text-center">
                  {note.note}
                </CardContent>
              </Card>
            ))}
            </div>
          </ScrollArea>
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}
