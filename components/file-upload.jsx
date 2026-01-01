'use client';
import { useState, useRef } from 'react';
import { Button } from 'antd';

export default function FileUpload({ setFileData }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);

  const onSubmit = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setFileData(data);
    }
  };

  return (
    <div>
        <div className='flex flex-row gap-4'>
            <input
                ref={inputRef}
                type="file"
                accept=".csv,.json"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFileName(file?.name ?? '');
                    setFile(e.target.files?.[0] ?? null)
                }}
            />
            <Button type="primary" onClick={() => inputRef.current?.click()}>Select File</Button>
            {fileName && <p>Selected: {fileName}</p>}
            <Button type="primary" onClick={onSubmit} disabled={!file}>Upload</Button>
        </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}