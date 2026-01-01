import { NextResponse } from 'next/server';
import { setFileData, getFileData } from '@/lib/serverState';

export async function POST(req) {
  const { action, key, itemData } = await req.json();
  const fileData = getFileData();
  const index = fileData.findIndex(item => item.key === key);
  console.log('Received action:', action, 'key:', key, 'itemData:', itemData);
  switch (action) {
    case 'delete':
      if (index < 0 || index >= fileData.length) {
        return NextResponse.json(
          { error: 'Index out of bounds' },
          { status: 400 }
        );
      };
      const deletedItem = fileData[index];
      fileData.splice(index, 1);
      setFileData(fileData);
      return NextResponse.json({ success: true, data: deletedItem });    
    case 'update':
      if (index < 0 || index >= fileData.length) {
        return NextResponse.json(
          { error: 'Index out of bounds' },
          { status: 400 }
        );
      }
      fileData[index] = { ...fileData[index], ...itemData };
      setFileData(fileData);
      return NextResponse.json({ success: true, data: fileData[index] });
    case 'add':
      fileData.push(itemData);
      setFileData(fileData);
      return NextResponse.json({ success: true, data: fileData.at(-1) });
  }
  return NextResponse.json(
    { error: 'Invalid action' },
    { status: 400 }
  );
}