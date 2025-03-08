"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"





export default function Admin() {

    const [link, setLink] = useState("");
    const [playerName, setPlayerName] = useState("");

    const postPlayer = async () => {
        const response = await fetch("/api/postPlayer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: playerName }),
        });
      
        await response.json();
        setPlayerName("");
      };

      const postVideo = async () => {
        const response = await fetch("/api/postGame", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: link }),
        });
      
        await response.json();
        setLink("");
      };
      
  return (

    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="flex flex-row items-center justify-center gap-4">
            <Input
                placeholder="Enter a YouTube URL"
                value={link}
                onChange={(e) => setLink(e.target.value)}
            />
            <Button onClick={ postVideo }>Post Video</Button> 
        </div>

        <div className="flex flex-row items-center justify-center gap-4">
            <Input
                placeholder="Enter a Player's Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
            />
            <Button onClick={ postPlayer }>Post Video</Button> 
        </div>
    </div>
  );
}
