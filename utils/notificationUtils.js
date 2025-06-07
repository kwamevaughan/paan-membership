import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { sendStatusEmail } from "./emailUtils";

export async function notifyMembers({
  title,
  description,
  tier_restriction,
  cta_text,
  cta_url,
  category,
  tags,
  req,
  res
}) {
  console.log('Starting notifyMembers with:', {
    title,
    descriptionLength: description?.length,
    tier_restriction,
    cta_text,
    cta_url,
    category,
    tags
  });

  try {
    const supabaseServer = createSupabaseServerClient(req, res);

    // Get email template
    const { data: template, error: templateError } = await supabaseServer
      .from('email_templates')
      .select('*')
      .eq('name', 'update_notification')
      .single();

    if (templateError) {
      console.error('Error fetching email template:', templateError);
      throw new Error('Failed to fetch email template');
    }

    if (!template || !template.body) {
      console.error('Email template not found or missing body');
      throw new Error('Email template not found or invalid');
    }

    console.log('Found email template:', template ? 'yes' : 'no');

    // Get members in the specified tier
    const { data: members, error: membersError } = await supabaseServer
      .from('candidates')
      .select('primaryContactName, primaryContactEmail')
      .ilike('selected_tier', `%${tier_restriction}%`);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      throw new Error('Failed to fetch members');
    }

    console.log(`Found ${members?.length || 0} members in tier ${tier_restriction}`);

    if (!members || members.length === 0) {
      console.log('No members found in the specified tier');
      return { notifiedCount: 0 };
    }

    // Process tags if they exist
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    const tagsHtml = processedTags.length > 0 
      ? `<div style="margin-top: 20px;">
           <strong>Tags:</strong><br/>
           ${processedTags.map(tag => `<span style="display: inline-block; background-color: #f0f0f0; padding: 4px 8px; margin: 2px; border-radius: 4px;">${tag}</span>`).join('')}
         </div>`
      : '';

    // Process CTA if it exists
    const ctaHtml = (cta_text && cta_url) 
      ? `<div style="margin-top: 20px; text-align: center;">
           <a href="${cta_url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
             ${cta_text}
           </a>
         </div>`
      : '';

    // Process description - ensure it's properly formatted
    const processedDescription = description 
      ? description.replace(/\n/g, '<br/>')  // Convert newlines to <br/>
      : '';

    let notifiedCount = 0;
    const errors = [];

    // Send emails to each member
    for (const member of members) {
      if (!member.primaryContactEmail) {
        console.log(`Skipping member ${member.primaryContactName} - no email address`);
        continue;
      }

      try {
        // Replace template variables
        let emailBody = template.body
          .replace(/{{title}}/g, title || '')
          .replace(/{{primaryContactName}}/g, member.primaryContactName || '')
          .replace(/{{description}}/g, processedDescription || '')
          .replace(/{{category}}/g, category || '')
          .replace(/{{tier_restriction}}/g, tier_restriction || '')
          .replace(/{{tags}}/g, tagsHtml)
          .replace(/{{cta}}/g, ctaHtml)
          // Handle conditional sections
          .replace(/{{#if cta_text}}([\s\S]*?){{\/if}}/g, (match, content) => {
            return cta_text ? content.replace(/{{cta_url}}/g, cta_url).replace(/{{cta_text}}/g, cta_text) : '';
          })
          .replace(/{{#if tags}}([\s\S]*?){{\/if}}/g, (match, content) => {
            return processedTags.length > 0 ? content : '';
          })
          .replace(/{{#each tags}}([\s\S]*?){{\/each}}/g, (match, content) => {
            return processedTags.map(tag => content.replace(/{{this}}/g, tag)).join('');
          });

        // Remove any empty sections
        emailBody = emailBody
          .replace(/<div[^>]*>\s*<\/div>/g, '')  // Remove empty divs
          .replace(/<p[^>]*>\s*<\/p>/g, '')     // Remove empty paragraphs
          .replace(/\n\s*\n/g, '\n');           // Remove multiple newlines

        console.log(`Sending email to ${member.primaryContactEmail}`);

        await sendStatusEmail({
          primaryContactName: member.primaryContactName,
          primaryContactEmail: member.primaryContactEmail,
          subject: `PAAN Update: ${title}`,
          template: emailBody,
        });

        notifiedCount++;
        console.log(`Successfully sent email to ${member.primaryContactEmail}`);
      } catch (error) {
        console.error(`Failed to send email to ${member.primaryContactEmail}:`, error);
        errors.push({
          email: member.primaryContactEmail,
          error: error.message
        });
      }
    }

    console.log(`Notification summary: ${notifiedCount} emails sent, ${errors.length} failed`);
    if (errors.length > 0) {
      console.error('Failed emails:', errors);
    }

    return { notifiedCount };
  } catch (error) {
    console.error('Error in notifyMembers:', error);
    throw error;
  }
} 