export const calculateSEOScore = (formData, editorContent) => {
  let score = 0;
  let totalChecks = 0;

  // Basic SEO checks
  if (formData.article_name?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) score++;
  if (formData.description?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) score++;
  if (formData.slug?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) score++;
  if (editorContent?.toLowerCase().includes(formData.focus_keyword?.toLowerCase())) score++;
  if (editorContent?.split(/\s+/).filter(Boolean).length >= 600) score++;
  totalChecks += 5;

  // Additional SEO checks
  const headings = editorContent?.match(/<h[2-4][^>]*>.*?<\/h[2-4]>/gi) || [];
  if (headings.some(h => h.toLowerCase().includes(formData.focus_keyword?.toLowerCase()))) score++;
  const altTexts = editorContent?.match(/alt="[^"]*"/gi) || [];
  if (altTexts.some(alt => alt.toLowerCase().includes(formData.focus_keyword?.toLowerCase()))) score++;
  const density = editorContent ? ((editorContent.toLowerCase().match(new RegExp(formData.focus_keyword?.toLowerCase(), 'g')) || []).length / (editorContent.split(/\s+/).filter(Boolean).length || 1)) * 100 : 0;
  if (density >= 0.5 && density <= 2.5) score++;
  if (formData.slug?.length <= 60) score++;
  if (editorContent?.includes('href="http')) score++;
  if (editorContent?.includes('href="/')) score++;
  totalChecks += 6;

  // Readability checks
  const firstWords = formData.article_name?.toLowerCase().split(' ').slice(0, 3).join(' ');
  if (firstWords?.includes(formData.focus_keyword?.toLowerCase())) score++;
  const sentimentWords = ['best', 'worst', 'amazing', 'terrible', 'great', 'poor', 'excellent', 'bad', 'good', 'fantastic', 'awful'];
  if (sentimentWords.some(word => formData.article_name?.toLowerCase().includes(word))) score++;
  const powerWords = ['ultimate', 'essential', 'proven', 'exclusive', 'secret', 'guaranteed', 'powerful', 'revolutionary', 'breakthrough', 'innovative'];
  if (powerWords.some(word => formData.article_name?.toLowerCase().includes(word))) score++;
  if (/\d+/.test(formData.article_name)) score++;
  if (editorContent?.toLowerCase().includes('table of contents') || editorContent?.toLowerCase().includes('contents')) score++;
  const paragraphs = editorContent?.split('</p>') || [];
  if (paragraphs.every(p => p.split(/\s+/).filter(Boolean).length <= 150)) score++;
  if (editorContent?.includes('<img')) score++;
  totalChecks += 7;

  return Math.round((score / totalChecks) * 100);
};

export const getScoreColor = (score, mode) => {
  if (score >= 90) return mode === 'dark' ? 'text-green-400' : 'text-green-600';
  if (score >= 80) return mode === 'dark' ? 'text-blue-400' : 'text-blue-600';
  if (score >= 70) return mode === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
  if (score >= 60) return mode === 'dark' ? 'text-orange-400' : 'text-orange-600';
  return mode === 'dark' ? 'text-red-400' : 'text-red-600';
};

export const getScoreBgColor = (score, mode) => {
  if (score >= 90) return mode === 'dark' ? 'bg-green-900/20' : 'bg-green-50';
  if (score >= 80) return mode === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50';
  if (score >= 70) return mode === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-50';
  if (score >= 60) return mode === 'dark' ? 'bg-orange-900/20' : 'bg-orange-50';
  return mode === 'dark' ? 'bg-red-900/20' : 'bg-red-50';
};

export const getScoreIcon = (score) => {
  if (score >= 90) return 'heroicons:star';
  if (score >= 80) return 'heroicons:check-circle';
  if (score >= 70) return 'heroicons:exclamation-circle';
  if (score >= 60) return 'heroicons:exclamation-triangle';
  return 'heroicons:x-circle';
}; 