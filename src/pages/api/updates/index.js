import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notifyMembers } from "../../../../utils/notificationUtils";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching updates:', error);
        return res.status(500).json({ error: 'Failed to fetch updates' });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Error in updates API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, title, description, category, tier_restriction, tags, cta_text, cta_url, notify_members } = req.body;

    // Validate required fields
    if (!title || !description || !category || !tier_restriction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Process tags - convert string to array if needed
    const processedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim()).filter(Boolean)) : [];

    if (req.method === 'POST') {
      // Create new update
      const { data, error } = await supabase
        .from('updates')
        .insert([
          {
            title,
            description,
            category,
            tier_restriction,
            tags: processedTags,
            cta_text: cta_text || '',
            cta_url: cta_url || '',
            notify_members: notify_members || false,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating update:', error);
        return res.status(500).json({ error: 'Failed to create update' });
      }

      // If notifications are enabled, send them asynchronously
      if (notify_members) {
        // Don't await the notification process
        notifyMembers({
          title,
          description,
          tier_restriction,
          cta_text,
          cta_url,
          category,
          tags: processedTags,
          req,
          res
        }).catch(error => {
          console.error('Error sending notifications:', error);
        });
      }

      return res.status(201).json(data);
    } else {
      // Update existing update
      if (!id) {
        return res.status(400).json({ error: 'Update ID is required' });
      }

      const { data, error } = await supabase
        .from('updates')
        .update({
          title,
          description,
          category,
          tier_restriction,
          tags: processedTags,
          cta_text: cta_text || '',
          cta_url: cta_url || '',
          notify_members: notify_members || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating update:', error);
        return res.status(500).json({ error: 'Failed to update update' });
      }

      return res.status(200).json(data);
    }
  } catch (error) {
    console.error('Error in updates API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 