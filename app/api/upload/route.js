import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import { nanoid } from 'nanoid';
import { setFileData } from '@/lib/serverState';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'No file uploaded' },
      { status: 400 }
    );
  }
  const fileType = file.type;
  const fileName = file.name;
  const text = await file.text();

  try {
    // JSON file
    if (fileName.endsWith('.json')) {
      const json = JSON.parse(text);
      const withKey = json.map((row) => ({
        key: nanoid(),
        ...row,
      }));
      setFileData(withKey);
      return NextResponse.json(withKey);
    }

    // CSV file
    if (fileName.endsWith('.csv')) {
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (parsed.errors.length) {
        throw parsed.errors;
      }
      const withKey = parsed.data.map((row, index) => ({
        key: nanoid(),
        ...row,
      }));
      setFileData(withKey);
      return NextResponse.json(withKey);
    }

    return NextResponse.json(
      { error: 'Unsupported file type' },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to parse file', detail: err },
      { status: 400 }
    );
  }
  
}