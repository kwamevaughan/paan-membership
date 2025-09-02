const fs = require('fs');

// Read the current validation file
let validationContent = fs.readFileSync('src/hooks/useFormValidation.js', 'utf8');

// Fix the malformed case statement - remove secondary contact fields from URL validation
validationContent = validationContent.replace(
  `      case "websiteUrl":
      case "primaryContactLinkedin",
          "secondaryContactName",
          "secondaryContactRole",
          "secondaryContactEmail",
          "secondaryContactPhone",
          "secondaryContactName",
          "secondaryContactRole", 
          "secondaryContactEmail",
          "secondaryContactPhone":`,
  `      case "websiteUrl":
      case "primaryContactLinkedin":`
);

// Write the fixed content back
fs.writeFileSync('src/hooks/useFormValidation.js', validationContent);
console.log('Fixed validation syntax - removed secondary contact fields from URL validation');
