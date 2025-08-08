-- Insert the opportunity notification email template
INSERT INTO email_templates (name, subject, body) VALUES (
  'opportunity_notification',
  'New PAAN Opportunity: {{title}}',
  '<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
        <!-- Header with Logo -->
        <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
            <img src="https://membership.paan.africa/assets/images/logo.png" alt="PAAN Logo" style="max-width: 150px;">
        </div>

        <!-- Greeting -->
        <div style="padding: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #333;">Dear {{primaryContactName}},</p>

            <p style="margin: 0; font-size: 16px; color: #333;">
            We''re excited to share a new opportunity with you from the Pan-African Agency Network.</p>

        </div>

        <!-- Opportunity Content -->
        <div style="padding: 20px 0; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
            <h2 style="margin: 0 0 20px 0; color: #333; font-size: 24px;">{{title}}</h2>
            <div style="color: #666; font-size: 16px; line-height: 1.6;">
                {{description}}
            </div>
        </div>

        <!-- Opportunity Details -->
        <div style="padding: 20px 0; border-bottom: 1px solid #eee; background-color: #f8fafc; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #1e40af;">Opportunity Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <p style="margin: 0 0 10px 0;"><strong>Type:</strong> {{opportunityDetails.job_type}}</p>
                    {{#if opportunityDetails.project_type}}
                    <p style="margin: 0 0 10px 0;"><strong>Project Type:</strong> {{opportunityDetails.project_type}}</p>
                    {{/if}}
                    {{#if opportunityDetails.skills_required}}
                    <p style="margin: 0 0 10px 0;"><strong>Skills Required:</strong> {{opportunityDetails.skills_required}}</p>
                    {{/if}}
                </div>
                <div>
                    {{#if opportunityDetails.location}}
                    <p style="margin: 0 0 10px 0;"><strong>Location:</strong> {{opportunityDetails.location}}</p>
                    {{/if}}
                    {{#if opportunityDetails.deadline}}
                    <p style="margin: 0 0 10px 0;"><strong>Deadline:</strong> {{opportunityDetails.deadline}}</p>
                    {{/if}}
                    {{#if opportunityDetails.budget}}
                    <p style="margin: 0 0 10px 0;"><strong>Budget:</strong> {{opportunityDetails.budget}}</p>
                    {{/if}}
                </div>
            </div>
        </div>

        <!-- Category and Tier -->
        <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
            <div style="display: inline-block; margin-right: 10px; background-color: #f0f0f0; padding: 5px 10px; border-radius: 15px; font-size: 14px; color: #666;">
                {{opportunityDetails.category}}
            </div>
            <div style="display: inline-block; background-color: #e8f0fe; padding: 5px 10px; border-radius: 15px; font-size: 14px; color: #1a73e8;">
                {{tier_restriction}}
            </div>
        </div>

        <!-- Tags Section -->
        {{#if opportunityDetails.tags}}
        <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
            <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Related Tags:</div>
            {{#each opportunityDetails.tags}}
            <div style="display: inline-block; background-color: #e8f5e9; padding: 5px 10px; border-radius: 15px; font-size: 14px; color: #2e7d32; margin: 0 5px 5px 0;">
                {{this}}
            </div>
            {{/each}}
        </div>
        {{/if}}

        <!-- Footer -->
        <div style="background-color: #231812; color: white; padding: 20px; text-align: center; font-size: 14px;">
            <address style="margin-top: 20px; font-style: normal; color: #ffffff;">
                <strong>Pan-African Agency Network</strong><br>
                Mitsumi Business Park, 7th floor<br>
                Nairobi, Kenya<br>
                <a href="tel:+254701850850" style="color: #f05d23; text-decoration: none;">+254 701 850 850</a>
            </address>
            <div style="margin-top: 15px;">
                <a href="https://www.linkedin.com/company/paan-africa/" target="_blank" style="color: #f05d23; text-decoration: none; margin: 0 10px;">LinkedIn</a> |
                <a href="https://twitter.com/paan_africa" target="_blank" style="color: #f05d23; text-decoration: none; margin: 0 10px;">Twitter</a> |
                <a href="https://www.instagram.com/paan_africa/" target="_blank" style="color: #f05d23; text-decoration: none; margin: 0 10px;">Instagram</a>
            </div>
            <div style="margin-top: 15px; font-size: 12px;">
                <a href="https://paan.africa/privacy-policy" style="color: #f05d23; text-decoration: none;">Privacy Policy</a> |
                <a href="https://paan.africa/terms" style="color: #f05d23; text-decoration: none;">Terms of Service</a>
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #ffffff;">© 2025 Pan-African Agency Network. All rights reserved.</p>
        </div>
    </div>
</body>'
); 