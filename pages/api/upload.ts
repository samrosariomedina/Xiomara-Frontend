import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Fields, Files, File } from 'formidable';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false, // Disabling body parser for file uploads
  },
};

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`Handling ${req.method} request to ${req.url}`);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Ensure the upload directory exists
    const uploadDir = path.join(process.cwd(), 'tmp');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Error creating upload directory:', err);
    }

    console.log('Upload directory:', uploadDir);

    // Parse the form data
    const form = formidable({ 
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    // Log for debugging
    console.log('Parsing form data...');
    
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) {
          console.error('Form parsing error:', err);
          reject(err);
          return;
        }
        console.log('Form parsed successfully');
        console.log('Fields:', Object.keys(fields));
        console.log('Files:', Object.keys(files));
        resolve([fields, files]);
      });
    });

    // For formidable v4, the file structure has changed
    const fileArray = files.file as unknown as File[];
    const file = fileArray && fileArray.length > 0 ? fileArray[0] : null;
    
    const token = fields.token ? 
      (Array.isArray(fields.token) ? fields.token[0] : fields.token) : 
      null;

    console.log('File:', file ? `${file.originalFilename} (${file.size} bytes)` : 'No file');
    console.log('Token:', token ? 'Present' : 'Missing');

    if (!file || !token) {
      return res.status(400).json({ error: 'File or token is missing' });
    }

    // Create a mock response for testing
    return res.status(200).json({
      success: true,
      url: `/uploads/${file.originalFilename}`,
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype
    });

    // Read the file content
    /* Uncomment when backend is ready
    const fileContent = await fs.readFile(file.filepath);
    
    // Create form data for backend
    const formData = new FormData();
    const blob = new Blob([Buffer.from(fileContent)]);
    formData.append('file', blob, file.originalFilename || 'file');
    formData.append('token', token.toString());

    // Send the file to the backend
    const backendRes = await fetch(`${BACKEND}/sources/file`, {
      method: 'POST',
      body: formData,
    });

    // Clean up the temporary file
    try {
      await fs.unlink(file.filepath);
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }

    if (!backendRes.ok) {
      const errorText = await backendRes.text().catch(() => '');
      return res.status(backendRes.status).json({ 
        error: errorText || 'Failed to upload file',
        status: backendRes.status
      });
    }

    // Return the backend response with the file URL
    const data = await backendRes.json();
    return res.status(200).json({
      success: true,
      url: data.url || data.path || data.location || data.file,
      ...data
    });
    */
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ 
      error: 'Internal server error during file upload',
      details: err instanceof Error ? err.message : String(err)
    });
  }
}
