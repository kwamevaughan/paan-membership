export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('[trigger-email-processing] Triggering email processing...');
    
    const baseUrl = process.env.NODE_ENV === "development"
      ? process.env.BASE_URL || "http://localhost:3000"
      : process.env.PRODUCTION_URL || "https://membership.paan.africa";
    
    const processUrl = `${baseUrl}/api/process-pending-submissions`;
    
    const response = await fetch(processUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('[trigger-email-processing] Processing result:', result.message);
      return res.status(200).json({ success: true, message: result.message });
    } else {
      console.error('[trigger-email-processing] Processing failed:', result);
      return res.status(500).json({ success: false, error: result.message });
    }
    
  } catch (error) {
    console.error('[trigger-email-processing] Error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
}