import { jsPDF } from 'jspdf';
import { StudyPack, PDFExportSettings } from '../types';

export function generateStudyGuidePDF(pack: StudyPack, settings: PDFExportSettings): jsPDF {
  const isA4 = settings.paper === 'a4';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA4 ? 'a4' : 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Style-specific color palettes
  const styles = {
    modern: {
      primary: [30, 41, 59], // Slate 800
      secondary: [79, 70, 229], // Indigo 600
      accent: [241, 245, 249], // Slate 100
      text: [30, 41, 59],
      muted: [100, 116, 139],
      boxBg: [248, 250, 252],
      boxBorder: [226, 232, 240],
      fontTitle: 'helvetica',
      fontBody: 'helvetica',
    },
    academic: {
      primary: [15, 23, 42],
      secondary: [51, 65, 85],
      accent: [248, 250, 252],
      text: [15, 23, 42],
      muted: [71, 85, 105],
      boxBg: [255, 255, 255],
      boxBorder: [203, 213, 225],
      fontTitle: 'times',
      fontBody: 'times',
    },
    minimal: {
      primary: [0, 0, 0],
      secondary: [40, 40, 40],
      accent: [250, 250, 250],
      text: [20, 20, 20],
      muted: [90, 90, 90],
      boxBg: [255, 255, 255],
      boxBorder: [180, 180, 180],
      fontTitle: 'helvetica',
      fontBody: 'helvetica',
    },
    notebook: {
      primary: [24, 49, 83], // Warm Navy
      secondary: [37, 99, 235], // Blue
      accent: [254, 252, 240], // Warm paper
      text: [33, 37, 41],
      muted: [108, 117, 125],
      boxBg: [254, 252, 245],
      boxBorder: [214, 211, 191],
      fontTitle: 'helvetica',
      fontBody: 'helvetica',
    },
  };

  const theme = styles[settings.style] || styles.modern;

  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin;
      drawHeader();
    }
  }

  function drawHeader() {
    doc.setFont(theme.fontBody, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
    doc.text('DASTANAY · Study Companion', margin, margin - 8);
    doc.text(pack.title.slice(0, 40), pageWidth - margin, margin - 8, { align: 'right' });
    doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, margin - 6, pageWidth - margin, margin - 6);
  }

  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  doc.setFillColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
  doc.rect(margin, margin, contentWidth, 3, 'F');

  y = margin + 25;

  // Brand Name
  doc.setFont(theme.fontTitle, 'bold');
  doc.setFontSize(26);
  doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
  doc.text('DASTANAY', margin, y);

  y += 8;
  doc.setFont(theme.fontBody, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
  doc.text('Turn Learning Into a Story.', margin, y);

  // Big decorative title block
  y += 35;
  doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.roundedRect(margin, y, contentWidth, 65, 3, 3, 'F');
  doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 65, 3, 3, 'S');

  doc.setFont(theme.fontBody, 'bold');
  doc.setFontSize(10);
  doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
  doc.text('OFFICIAL STUDY GUIDE', margin + 8, y + 14);

  doc.setFont(theme.fontTitle, 'bold');
  doc.setFontSize(20);
  doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
  const splitTitle = doc.splitTextToSize(pack.title, contentWidth - 16);
  doc.text(splitTitle, margin + 8, y + 26);

  doc.setFont(theme.fontBody, 'normal');
  doc.setFontSize(10);
  doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
  doc.text(`Subject: ${pack.subject}  ·  Curriculum Focus: ${pack.difficulty}`, margin + 8, y + 48);
  doc.text(`Format: ${settings.style.toUpperCase()} Edition  ·  ${settings.language}`, margin + 8, y + 55);

  y += 85;

  // Metadata block
  doc.setFont(theme.fontBody, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
  doc.text('DOCUMENT SPECIFICATIONS', margin, y);
  y += 6;
  doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + 50, y);
  y += 8;

  doc.setFont(theme.fontBody, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);

  const dateStr = new Date(pack.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const includedSections: string[] = [];
  if (settings.includeExecutiveSummary) includedSections.push('Summary');
  if (settings.includeChapterNotes) includedSections.push('Chapter Notes');
  if (settings.includeFormulas) includedSections.push('Formulas');
  if (settings.includeDefinitions) includedSections.push('Definitions');
  if (settings.includeQuestions) includedSections.push('Exam Questions');
  if (settings.includeMcqs) includedSections.push('MCQs');
  if (settings.includeQuickRevision) includedSections.push('Revision Sheet');

  const metadataRows = [
    ['Prepared From:', pack.sourceAttribution || 'User Learning Material'],
    ['Publication Date:', dateStr],
    ['Difficulty Level:', pack.difficulty],
    ['Included Modules:', includedSections.join(', ') || 'Custom Selection'],
  ];

  for (const [label, val] of metadataRows) {
    doc.setFont(theme.fontBody, 'bold');
    doc.text(label, margin, y);
    doc.setFont(theme.fontBody, 'normal');
    doc.text(val, margin + 40, y);
    y += 7;
  }

  // Cover Safety Disclaimer at bottom
  y = pageHeight - margin - 20;
  doc.setFont(theme.fontBody, 'italic');
  doc.setFontSize(8);
  doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
  const disclaimerText = 'Notice: Generated by DASTANAY AI from user-provided educational material. Not an officially sanctioned board or institution paper. Examination questions and points are potentially important based on provided material.';
  const splitDisclaimer = doc.splitTextToSize(disclaimerText, contentWidth);
  doc.text(splitDisclaimer, margin, y);

  // ==========================================
  // PAGE 2: TABLE OF CONTENTS & EXECUTIVE SUMMARY
  // ==========================================
  if (settings.includeToc) {
    doc.addPage();
    y = margin;
    drawHeader();

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Table of Contents', margin, y);
    y += 4;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + 30, y);
    y += 12;

    const tocItems = [
      ...(settings.includeExecutiveSummary ? [{ num: '01', title: 'Executive 5-Minute Summary', page: '3' }] : []),
      ...(settings.includeChapterNotes ? pack.chapters.map((ch, idx) => ({
        num: `0${idx + 2}`,
        title: ch.chapterTitle,
        page: `${idx + 3}`,
      })) : []),
      ...(settings.includeFormulas && pack.formulas.length > 0 ? [{ num: '05', title: 'Important Formulas & Mathematical Laws', page: '4' }] : []),
      ...(settings.includeDefinitions && pack.definitions.length > 0 ? [{ num: '06', title: 'Key Definitions & Terminology', page: '5' }] : []),
      ...(settings.includeQuestions && pack.questions.length > 0 ? [{ num: '07', title: 'High-Yield Examination Questions', page: '6' }] : []),
      ...(settings.includeMcqs && pack.mcqs.length > 0 ? [{ num: '08', title: 'Practice MCQs & Rationales', page: '7' }] : []),
      ...(settings.includeQuickRevision ? [{ num: '09', title: 'Quick Revision Sheet & Common Pitfalls', page: 'Final' }] : []),
    ];

    doc.setFont(theme.fontBody, 'normal');
    for (const item of tocItems) {
      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
      doc.text(item.num, margin, y);

      doc.setFont(theme.fontBody, 'normal');
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.text(item.title, margin + 12, y);

      const textWidth = doc.getTextWidth(item.title);
      const dotStart = margin + 16 + textWidth;
      const dotEnd = pageWidth - margin - 15;
      if (dotEnd > dotStart) {
        doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
        let dotX = dotStart;
        while (dotX < dotEnd) {
          doc.text('.', dotX, y);
          dotX += 3;
        }
      }

      doc.setFont(theme.fontBody, 'bold');
      doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
      doc.text(item.page, pageWidth - margin, y, { align: 'right' });

      y += 8.5;
    }

    if (settings.includeExecutiveSummary) {
      y += 8;
      // Executive 5-Minute Summary Box
      doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
      doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'F');
      doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 48, 2, 2, 'S');

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
      doc.text('5-MINUTE EXECUTIVE SUMMARY', margin + 6, y + 8);

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
      const summaryLines = doc.splitTextToSize(pack.summary, contentWidth - 12);
      doc.text(summaryLines.slice(0, 6), margin + 6, y + 16);
    }
  }

  // ==========================================
  // CHAPTER NOTES PAGES
  // ==========================================
  if (settings.includeChapterNotes && pack.chapters.length > 0) {
    doc.addPage();
    y = margin;
    drawHeader();

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Structured Study Notes', margin, y);
    y += 4;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 40, y);
    y += 10;

    for (const chap of pack.chapters) {
      checkPageBreak(50);

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(11);
      doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
      doc.text(`CHAPTER ${chap.chapterNumber}: ${chap.chapterTitle.toUpperCase()}`, margin, y);
      y += 6;

      // Main Concept
      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.text('1. Main Concept', margin, y);
      y += 4;

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
      const conceptLines = doc.splitTextToSize(chap.mainConcept, contentWidth);
      doc.text(conceptLines, margin, y);
      y += conceptLines.length * 4.2 + 4;

      // Key Idea Box
      if (settings.includeKeyIdeas) {
        checkPageBreak(25);
        doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
        const keyLines = doc.splitTextToSize(chap.keyIdea, contentWidth - 10);
        const boxHeight = keyLines.length * 4.2 + 10;
        doc.roundedRect(margin, y, contentWidth, boxHeight, 1.5, 1.5, 'F');
        doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
        doc.setLineWidth(0.6);
        doc.line(margin, y, margin, y + boxHeight);

        doc.setFont(theme.fontBody, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
        doc.text('KEY IDEA', margin + 5, y + 5);

        doc.setFont(theme.fontBody, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        doc.text(keyLines, margin + 5, y + 10);
        y += boxHeight + 4;
      }

      // Remember Callout
      checkPageBreak(20);
      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9);
      doc.text('REMEMBER:', margin, y);

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
      const remLines = doc.splitTextToSize(chap.remember, contentWidth - 25);
      doc.text(remLines, margin + 22, y);
      y += remLines.length * 4.2 + 4;

      // Example Box
      if (chap.example) {
        checkPageBreak(20);
        doc.setFont(theme.fontBody, 'bold');
        doc.setFontSize(8);
        doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
        doc.text('EXAMPLE:', margin, y);

        doc.setFont(theme.fontBody, 'italic');
        doc.setFontSize(8);
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        const exLines = doc.splitTextToSize(chap.example, contentWidth - 22);
        doc.text(exLines, margin + 20, y);
        y += exLines.length * 4.2 + 6;
      }

      doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 8;
    }
  }

  // ==========================================
  // FORMULAS SECTION
  // ==========================================
  if (settings.includeFormulas && pack.formulas.length > 0) {
    checkPageBreak(60);

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Key Formulas & Relationships', margin, y);
    y += 4;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 35, y);
    y += 8;

    for (const f of pack.formulas) {
      checkPageBreak(35);

      doc.setFillColor(theme.boxBg[0], theme.boxBg[1], theme.boxBg[2]);
      doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
      doc.text(f.name.toUpperCase(), margin + 5, y + 6);

      doc.setFont('courier', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.text(f.formula, margin + 5, y + 13);

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
      const varsStr = f.variables.map(v => `${v.symbol} = ${v.meaning}${v.unit ? ` (${v.unit})` : ''}`).join('  ·  ');
      const splitVars = doc.splitTextToSize(varsStr, contentWidth - 10);
      doc.text(splitVars[0] || '', margin + 5, y + 20);

      y += 30;
    }
  }

  // ==========================================
  // DEFINITIONS SECTION
  // ==========================================
  if (settings.includeDefinitions && pack.definitions.length > 0) {
    checkPageBreak(50);

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Key Academic Definitions', margin, y);
    y += 4;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 35, y);
    y += 8;

    for (const def of pack.definitions) {
      checkPageBreak(25);

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.text(`┌── ${def.term} ──┐`, margin, y);
      y += 4.5;

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
      const defLines = doc.splitTextToSize(def.definition, contentWidth - 8);
      doc.text(defLines, margin + 4, y);
      y += defLines.length * 4.2;

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
      doc.text('└────────────────────────────┘', margin, y);
      y += 6;
    }
  }

  // ==========================================
  // QUESTIONS & GUIDELINES SECTION
  // ==========================================
  if (settings.includeQuestions && pack.questions.length > 0) {
    checkPageBreak(50);

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('High-Yield Examination Questions', margin, y);
    y += 4;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 45, y);
    y += 8;

    pack.questions.forEach((q, idx) => {
      checkPageBreak(30);

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
      doc.text(`Q${idx + 1} [${q.type.toUpperCase()} · ${q.marks || 2} MARKS]`, margin, y);
      y += 4.5;

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      const qLines = doc.splitTextToSize(q.question, contentWidth);
      doc.text(qLines, margin, y);
      y += qLines.length * 4.2 + 2;

      if (settings.includeAnswers && q.answerGuideline) {
        doc.setFont(theme.fontBody, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
        doc.text('Model Answer / Solution:', margin, y);
        y += 4;

        doc.setFont(theme.fontBody, 'normal');
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        const aLines = doc.splitTextToSize(q.answerGuideline, contentWidth);
        doc.text(aLines, margin, y);
        y += aLines.length * 4 + 4;
      }
      y += 3;
    });
  }

  // ==========================================
  // MCQS SECTION
  // ==========================================
  if (settings.includeMcqs && pack.mcqs.length > 0) {
    checkPageBreak(50);

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Multiple Choice Self-Assessment', margin, y);
    y += 4;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(0.6);
    doc.line(margin, y, margin + 45, y);
    y += 8;

    pack.mcqs.forEach((mcq, idx) => {
      checkPageBreak(35);

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
      doc.text(`MCQ ${idx + 1} · ${mcq.topic}`, margin, y);
      y += 4.5;

      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      const mcqLines = doc.splitTextToSize(mcq.question, contentWidth);
      doc.text(mcqLines, margin, y);
      y += mcqLines.length * 4.2 + 2;

      mcq.options.forEach((opt, oIdx) => {
        const letter = String.fromCharCode(65 + oIdx);
        const isCorrect = oIdx === mcq.correctIndex;
        doc.setFont(theme.fontBody, isCorrect ? 'bold' : 'normal');
        doc.setFontSize(8);
        doc.setTextColor(isCorrect ? theme.secondary[0] : theme.text[0], isCorrect ? theme.secondary[1] : theme.text[1], isCorrect ? theme.secondary[2] : theme.text[2]);
        doc.text(`${letter}. ${opt} ${isCorrect ? '(Correct)' : ''}`, margin + 4, y);
        y += 4;
      });

      if (mcq.explanation) {
        doc.setFont(theme.fontBody, 'italic');
        doc.setFontSize(7.5);
        doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
        const expLines = doc.splitTextToSize(`Explanation: ${mcq.explanation}`, contentWidth - 4);
        doc.text(expLines, margin + 4, y);
        y += expLines.length * 3.8 + 3;
      }
      y += 3;
    });
  }

  // ==========================================
  // FINAL PAGE: QUICK REVISION SHEET
  // ==========================================
  if (settings.includeQuickRevision) {
    doc.addPage();
    y = margin;
    drawHeader();

    doc.setFont(theme.fontTitle, 'bold');
    doc.setFontSize(16);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Quick Revision Sheet', margin, y);
    doc.setFont(theme.fontBody, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
    doc.text('Everything you need to remember in 5 minutes', margin, y + 5);
    y += 10;
    doc.setDrawColor(theme.secondary[0], theme.secondary[1], theme.secondary[2]);
    doc.setLineWidth(0.8);
    doc.line(margin, y, margin + 40, y);
    y += 8;

    // Takeaways
    doc.setFont(theme.fontBody, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
    doc.text('Core Takeaways', margin, y);
    y += 5;

    doc.setFont(theme.fontBody, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
    for (const item of pack.revisionSheet.quickTakeaways) {
      const bulletLines = doc.splitTextToSize(`•  ${item}`, contentWidth - 4);
      doc.text(bulletLines, margin + 2, y);
      y += bulletLines.length * 4.2 + 2;
    }
    y += 6;

    // Common Pitfalls
    if (settings.includeCommonPitfalls && pack.revisionSheet.commonPitfalls.length > 0) {
      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(185, 28, 28);
      doc.text('Common Examination Pitfalls to Avoid', margin, y);
      y += 5;

      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
      for (const pit of pack.revisionSheet.commonPitfalls) {
        const pitLines = doc.splitTextToSize(`▲  ${pit}`, contentWidth - 4);
        doc.text(pitLines, margin + 2, y);
        y += pitLines.length * 4.2 + 2;
      }
      y += 8;
    }

    // Formula Cheat Table
    if (pack.revisionSheet.formulaCheatSheet.length > 0) {
      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.text('Formula Cheat Sheet', margin, y);
      y += 5;

      doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFont(theme.fontBody, 'bold');
      doc.setFontSize(8);
      doc.setTextColor(theme.primary[0], theme.primary[1], theme.primary[2]);
      doc.text('Concept / Quantity', margin + 4, y + 5);
      doc.text('Mathematical Expression', margin + 60, y + 5);
      y += 7;

      for (const fc of pack.revisionSheet.formulaCheatSheet) {
        doc.setFont(theme.fontBody, 'normal');
        doc.setFontSize(8);
        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
        doc.text(fc.name, margin + 4, y + 5);
        doc.setFont('courier', 'bold');
        doc.text(fc.formula, margin + 60, y + 5);
        y += 7;
        doc.setDrawColor(theme.boxBorder[0], theme.boxBorder[1], theme.boxBorder[2]);
        doc.setLineWidth(0.2);
        doc.line(margin, y, pageWidth - margin, y);
      }
    }

    y = pageHeight - margin - 15;
    doc.setFont(theme.fontBody, 'italic');
    doc.setFontSize(8);
    doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
    doc.text('DASTANAY — Turn Learning Into a Story.  ·  https://dastanay.app', margin, y);
  }

  // ==========================================
  // PAGE NUMBERS IN FOOTER
  // ==========================================
  if (settings.includePageNumbers) {
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont(theme.fontBody, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(theme.muted[0], theme.muted[1], theme.muted[2]);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - margin + 6, { align: 'right' });
    }
  }

  return doc;
}

export function downloadStudyGuide(pack: StudyPack, settings: PDFExportSettings): void {
  const doc = generateStudyGuidePDF(pack, settings);
  const cleanTitle = pack.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  doc.save(`DASTANAY_${cleanTitle}_StudyGuide.pdf`);
}
