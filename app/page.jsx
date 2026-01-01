'use client';
import { useState } from 'react';
import Image from "next/image";
import Chatbox from "@/components/chatbox/chatbox";
import InteractiveTable from "@/components/interactive-table";
import FileUpload from "@/components/file-upload";

export default function Home() {
  const [fileData, setFileData] = useState(null);
  return (
    <div className="font-sans">
      <div className="text-xl pt-10 pl-10 w-8/12">
        <FileUpload setFileData={setFileData} />
        <InteractiveTable data={fileData || []} setData={setFileData} className="mt-10 mb-2" />
      </div>
      <div className="fixed bottom-5 right-5 w-1/4 bg-white">
        <Chatbox />
      </div>
    </div>
  );
}
