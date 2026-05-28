import jsPDF from 'jspdf';

const loadImage = (url: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = () => {
      console.warn(`Failed to load image: ${url}`);
      resolve('');
    };
  });
};

export const generatePitchDeck = async () => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Colors
  const bgDark = '#050505';
  const cardBg = '#1a1a1a';
  const textWhite = '#ffffff';
  const textGrey = '#a0a0a0';
  const brandAccent = '#F27D26';

  // Load Images
  const heroImage = await loadImage('https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1080&auto=format&fit=crop');
  const timeTravelImage = await loadImage('https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1080&auto=format&fit=crop');
  const plannerImage = await loadImage('https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1080&auto=format&fit=crop');

  // Helper: Draw Slide Background
  const drawSlideBg = () => {
    doc.setFillColor(bgDark);
    doc.rect(0, 0, width, height, 'F');
    // Subtle accent line at top
    doc.setFillColor(brandAccent);
    doc.rect(0, 0, width, 2, 'F');
  };

  // Helper: Add Logo/Footer
  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(textGrey);
    doc.text(`Aither Pitch Deck - Page ${pageNum}`, margin, height - 10);
    doc.text("Confidential", width - margin - 15, height - 10);
  };

  // --- Slide 1: Title Slide ---
  drawSlideBg();
  
  // Background Image with overlay
  if (heroImage) {
    doc.addImage(heroImage, 'JPEG', 0, 0, width, height);
    // Dark overlay
    doc.setFillColor(0, 0, 0);
    doc.setGState(new (doc as any).GState({ opacity: 0.7 }));
    doc.rect(0, 0, width, height, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
  }

  doc.setTextColor(brandAccent);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.text("AITHER", width / 2, height / 2 - 10, { align: 'center' });

  doc.setTextColor(textWhite);
  doc.setFontSize(24);
  doc.setFont("helvetica", "normal");
  doc.text("Travel Through Time & Space", width / 2, height / 2 + 10, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(200, 200, 200);
  doc.text("The AI-Powered Sustainable Travel Companion", width / 2, height / 2 + 25, { align: 'center' });
  
  addFooter(1);

  // --- Slide 2: The Problem ---
  doc.addPage();
  drawSlideBg();
  
  doc.setFontSize(32);
  doc.setTextColor(brandAccent);
  doc.text("The Problem", margin, margin + 15);

  doc.setFontSize(18);
  doc.setTextColor(textWhite);
  doc.text("Travel planning is broken, shallow, and anxious.", margin, margin + 35);

  // Cards for problem points
  const problemY = margin + 50;
  const cardWidth = (width - (margin * 2) - 20) / 3;
  
  const drawCard = (x: number, title: string, desc: string) => {
    doc.setFillColor(cardBg);
    doc.setDrawColor(50, 50, 50);
    doc.roundedRect(x, problemY, cardWidth, 80, 3, 3, 'FD'); // Increased height for more text
    
    doc.setFontSize(16);
    doc.setTextColor(brandAccent);
    doc.text(title, x + 5, problemY + 15);
    
    doc.setFontSize(11);
    doc.setTextColor(textGrey);
    const splitDesc = doc.splitTextToSize(desc, cardWidth - 10);
    doc.text(splitDesc, x + 5, problemY + 30);
  };

  drawCard(margin, "Fragmented", "Too many tabs, apps, and spreadsheets. The average traveler visits 38 websites before booking. It's a logistical nightmare that drains the joy of discovery before you even leave home.");
  
  drawCard(margin + cardWidth + 10, "Superficial", "Seeing the ruins, but missing the story. Without deep context, the Colosseum is just a pile of stones. We miss the roar of the crowd, the culture, and the human experience of the past.");
  
  drawCard(margin + (cardWidth + 10) * 2, "Uncertain", "Safety and environmental impact are often guessed, not planned. Travelers are forced to compromise on safety or sustainability simply because reliable, actionable data isn't integrated into their plans.");

  addFooter(2);

  // --- Slide 3: The Solution ---
  doc.addPage();
  drawSlideBg();

  doc.setFontSize(32);
  doc.setTextColor(brandAccent);
  doc.text("The Solution", margin, margin + 15);

  doc.setFontSize(16);
  doc.setTextColor(textWhite);
  const solutionText = "Aither is the all-in-one AI travel companion that doesn't just plan your trip—it transports you. It combines hyper-personalized logistics with immersive historical reconstruction.";
  doc.text(doc.splitTextToSize(solutionText, width - (margin * 2)), margin, margin + 35);

  // Visual representation of solution
  if (plannerImage) {
    doc.addImage(plannerImage, 'JPEG', margin, margin + 60, width - (margin * 2), 80);
    // Add a glassmorphic-like overlay box
    doc.setFillColor(0, 0, 0);
    doc.setGState(new (doc as any).GState({ opacity: 0.6 }));
    doc.roundedRect(margin + 10, margin + 100, 80, 30, 2, 2, 'F');
    doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
    
    doc.setTextColor(textWhite);
    doc.setFontSize(14);
    doc.text("AI-Driven Itineraries", margin + 15, margin + 110);
    doc.setFontSize(10);
    doc.setTextColor(textGrey);
    doc.text("Optimized for your preferences", margin + 15, margin + 120);
  }

  addFooter(3);

  // --- Slide 4: Time Travel Mode ---
  doc.addPage();
  drawSlideBg();

  doc.setFontSize(32);
  doc.setTextColor(brandAccent);
  doc.text("Time Travel Mode", margin, margin + 15);

  // Split layout
  const leftColW = (width / 2) - margin - 10;
  
  doc.setFontSize(14);
  doc.setTextColor(textWhite);
  doc.text("\"Don't just see the ruins. See the glory.\"", margin, margin + 35);
  
  doc.setFontSize(11);
  doc.setTextColor(textGrey);
  const ttPoints = [
    "• Upload a photo of any landmark.",
    "• AI identifies the location & era.",
    "• Generates photorealistic historical images.",
    "• Creates cinematic videos of the past.",
    "• Powered by Gemini 2.5 & Veo 3.1."
  ];
  let ttY = margin + 50;
  ttPoints.forEach(point => {
    doc.text(point, margin, ttY);
    ttY += 10;
  });

  if (timeTravelImage) {
    const imgX = width / 2;
    const imgY = margin + 25;
    const imgW = (width / 2) - margin;
    const imgH = height - (margin * 2) - 25;
    
    doc.addImage(timeTravelImage, 'JPEG', imgX, imgY, imgW, imgH);
    
    // "Before/After" label simulation
    doc.setFillColor(brandAccent);
    doc.rect(imgX, imgY + imgH - 10, 30, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("RECONSTRUCTED", imgX + 2, imgY + imgH - 3);
  }

  addFooter(4);

  // --- Slide 5: Tech Stack & Safety ---
  doc.addPage();
  drawSlideBg();

  doc.setFontSize(32);
  doc.setTextColor(brandAccent);
  doc.text("Under the Hood", margin, margin + 15);

  // Tech Stack Grid
  const techY = margin + 35;
  const techCardW = (width - (margin * 2) - 10) / 2;
  
  // Tech Card
  doc.setFillColor(cardBg);
  doc.roundedRect(margin, techY, techCardW, 60, 3, 3, 'F');
  doc.setFontSize(18);
  doc.setTextColor(textWhite);
  doc.text("Technology", margin + 10, techY + 15);
  doc.setFontSize(11);
  doc.setTextColor(textGrey);
  doc.text("• Frontend: React + Vite + Tailwind CSS", margin + 10, techY + 30);
  doc.text("• AI: Google Gemini Multimodal Models", margin + 10, techY + 40);
  doc.text("• Maps: Google Maps Integration", margin + 10, techY + 50);

  // Safety Card
  doc.setFillColor(cardBg);
  doc.roundedRect(margin + techCardW + 10, techY, techCardW, 60, 3, 3, 'F');
  doc.setFontSize(18);
  doc.setTextColor(textWhite);
  doc.text("Safety Intelligence", margin + techCardW + 20, techY + 15);
  doc.setFontSize(11);
  doc.setTextColor(textGrey);
  doc.text("• Real-time neighborhood advisories", margin + techCardW + 20, techY + 30);
  doc.text("• Severity ratings & caution reasons", margin + techCardW + 20, techY + 40);
  doc.text("• Sustainability impact scoring", margin + techCardW + 20, techY + 50);

  addFooter(5);

  // --- Slide 6: Call to Action ---
  doc.addPage();
  drawSlideBg();
  
  if (heroImage) {
      doc.addImage(heroImage, 'JPEG', 0, 0, width, height);
      doc.setFillColor(0, 0, 0);
      doc.setGState(new (doc as any).GState({ opacity: 0.8 }));
      doc.rect(0, 0, width, height, 'F');
      doc.setGState(new (doc as any).GState({ opacity: 1.0 }));
  }

  doc.setTextColor(textWhite);
  doc.setFontSize(40);
  doc.setFont("helvetica", "bold");
  doc.text("Experience History Today", width / 2, height / 2 - 10, { align: 'center' });

  doc.setTextColor(brandAccent);
  doc.setFontSize(16);
  doc.text("Plan with intelligence. Travel with confidence.", width / 2, height / 2 + 10, { align: 'center' });

  doc.save("Aither_Pitch_Deck.pdf");
};
