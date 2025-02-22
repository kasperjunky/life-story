// Version 4.1 - Agent 3: Strict Practical Advice & Step-by-Step Instructions

// ─────────────────────────────────────────────────────────────
// SECTION 1: Initialization & Global Variables
// ─────────────────────────────────────────────────────────────

function clearCache() {
  localStorage.clear();
  sessionStorage.clear();
  console.log("Cache cleared.");
}
clearCache();

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// DOM Elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const encouragingRewrite = document.getElementById("encouraging-rewrite");
const practicalAdvice = document.getElementById("practical-advice");
const practicalAdviceHeading = document.getElementById("practical-advice-heading");
const encouragingRewriteHeading = document.querySelector("#result-container h2:nth-of-type(2)");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");
const loadingContainer = document.getElementById("loading-container");

// Ensure questions.js is loaded
if (typeof questions === "undefined") {
  console.error("❌ Questions file not loaded! Check if questions.js is properly linked in index.html.");
}

// Initially hide certain elements
downloadButton.style.display = "none";
practicalAdvice.style.display = "none";
practicalAdviceHeading.style.display = "none";
encouragingRewriteHeading.style.display = "none";

// ─────────────────────────────────────────────────────────────
// SECTION 2: Utility Functions
// ─────────────────────────────────────────────────────────────

// Warm-Up API (Optional)
async function warmUpAPI() {
  try {
    // Replace with your keepalive endpoint if available
    await fetch("https://interactive-backend.onrender.com/api/keepalive", { method: "GET" });
    console.log("API warmed up!");
  } catch (error) {
    console.error("API warm-up failed:", error);
  }
}

// Fetch Insights from ChatGPT with new prompt for practicalAdvice
async function getInsightsFromChatGPT(answers, includeAdvice, insightType) {
  try {
    console.log(`📡 Fetching ${insightType} insights...`);
    const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: currentLanguage,
        answers,
        includeAdvice,
        prompts: {
          storySummary: "Summarize the user's answers objectively without added encouragement. Use only second-person language. The response must start exactly with: 'Based on your answers, you are a person who values' followed by a clear, factual summary.",
          encouragingRewrite: "Rewrite the user's life story with a supportive, empowering tone. Use only second-person language. Begin with: 'Here's a new way to view your story in an empowering light: You navigate...' and provide an uplifting, realistic perspective.",
          practicalAdvice: `Provide 3-5 short, specific, actionable steps the user can take to keep on empowering their inner story. 
                            The response must begin exactly with: 'Here are a few practical ways to keep on empowering your inner story:'
                            Each bullet point should be a single implementable action (e.g., 'Meditate for 1 minute every day and envision your new, stronger, confident self.'). 
                            Avoid vague phrases like 'this individual' or 'they'; use second-person only. The first sentence must not be preceded by any bullet or number.`
        }
      })
    });
    console.log(`✅ ${insightType} insights received.`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${insightType}:`, error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: Core Logic (Quiz & Insights)
// ─────────────────────────────────────────────────────────────

// Display the current question
function displayQuestion() {
  if (!questions || !questions[currentLanguage] || currentQuestionIndex >= questions[currentLanguage].length) {
    console.error("❌ No questions available for the selected language!");
    showResults();
    return;
  }
  const currentQuestion = questions[currentLanguage][currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";
  nextButton.disabled = true;

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.onclick = () => handleAnswer(button, index);
    optionsContainer.appendChild(button);
  });
}

// Handle answer selection
function handleAnswer(selectedButton, selectedIndex) {
  document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
  nextButton.disabled = false;
}

// Move to next question or show results
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions[currentLanguage].length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    showResults();
  }
});

// Show final results (Agents 1 & 2)
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  // Fetch "Your Life Story" (Agent 1)
  loadingContainer.style.display = "block";
  const insights = await getInsightsFromChatGPT(selectedAnswers, false, "Your Life Story");
  loadingContainer.style.display = "none";

  if (insights?.storySummary) {
    let summary = insights.storySummary;
    summary = summary.replace(/questionnaire answers provided/gi, "your answers")
                     .replace(/this user/gi, "you")
                     .replace(/the user/gi, "you")
                     .replace(/\byou's\b/gi, "you")
                     .replace(/you has/gi, "you have")
                     .trim();
    const desiredPrefix = "Based on your answers, you are a person who values";
    summary = summary.replace(new RegExp("^(?:" + desiredPrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\s*)+", "i"), desiredPrefix + " ");
    storySummary.textContent = summary;
  } else {
    storySummary.textContent = currentLanguage === "en" ? "No summary available." : "אין סיכום זמין.";
  }

  // Fetch "Encouraging Rewrite" (Agent 2)
  setTimeout(async () => {
    encouragingRewriteHeading.style.display = "block";
    loadingContainer.style.display = "block";
    const rewriteInsights = await getInsightsFromChatGPT(selectedAnswers, false, "Encouraging Rewrite");
    loadingContainer.style.display = "none";

    if (rewriteInsights?.encouragingRewrite) {
      let rewriteText = rewriteInsights.encouragingRewrite;
      rewriteText = rewriteText.replace(/^Reframing.*?light,?\s*/i, "")
                               .replace(/you is/gi, "you are")
                               .replace(/This user|The user/gi, "you")
                               .replace(/they/gi, "you");
      encouragingRewrite.textContent = rewriteText;
    } else {
      encouragingRewrite.textContent = currentLanguage === "en" ? "No rewritten version available." : "אין גרסה מחודשת זמינה.";
    }
    setTimeout(() => {
      downloadButton.style.display = "block";
    }, 500);
  }, 1500);
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: Practical Advice (Agent 3) & PDF Download
// ─────────────────────────────────────────────────────────────

adviceButton.addEventListener("click", async () => {
  practicalAdvice.style.display = "block";
  practicalAdviceHeading.style.display = "block";
  adviceButton.style.display = "none";
  loadingContainer.style.display = "block";

  // Fetch practical advice from ChatGPT (Agent 3)
  const insights = await getInsightsFromChatGPT(selectedAnswers, true, "Practical Advice");
  loadingContainer.style.display = "none";

  if (insights?.practicalAdvice && insights.practicalAdvice.length > 0) {
    // Post-processing for second-person, removing "this individual," "they," etc.
    const adviceList = insights.practicalAdvice.slice(0, 5);
    const formattedAdvice = adviceList.map((advice, index) => {
      let processed = advice
        .replace(/^To improve.*?\bthis individual\b.*?:?/i, "Here are a few practical ways to keep on empowering your inner story:")
        .replace(/this individual/gi, "you")
        .replace(/the user/gi, "you")
        .replace(/they/gi, "you")
        .trim();

      // Force it to start with: "Here are a few practical ways to keep on empowering your inner story:"
      if (index === 0) {
        // Ensure the first advice line is the intro + first bullet or just the intro
        processed = processed.replace(/^[•\d\.\s]*/, "");
        // If the user wrote "To improve their life story," etc., remove that.
        if (!processed.toLowerCase().startsWith("here are a few practical ways to keep on empowering your inner story:")) {
          processed = "Here are a few practical ways to keep on empowering your inner story:\n" + processed;
        }
        return `<li style="list-style:none; padding-left:0;"><strong>${processed}</strong></li>`;
      } else {
        // Standard bullet for subsequent items
        return `<li>${processed.replace(/^(\d+\.\s*)/, "").trim()}</li>`;
      }
    }).join("");
    practicalAdvice.innerHTML = formattedAdvice;
  } else {
    practicalAdvice.innerHTML = currentLanguage === "en" ? "<li>No practical advice available.</li>" : "<li>אין עצות מעשיות זמינות.</li>";
  }

  // If user wants to download after advice
  downloadButton.onclick = () => generateStyledPDF();
});

// Single event listener for generating PDF
function generateStyledPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(0, 102, 204);
  doc.text("Your Life Story", 10, yPos);
  yPos += 6;

  // Horizontal line
  doc.setDrawColor(0, 102, 204);
  doc.line(10, yPos, 200, yPos);
  yPos += 10;

  // Life Story Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Life Story Summary:", 10, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  let lines = doc.splitTextToSize(storySummary.textContent, 180);
  lines.forEach((line) => {
    yPos += 6;
    doc.text(line, 10, yPos);
  });
  yPos += 10;

  // Encouraging Rewrite
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Encouraging Rewrite:", 10, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  lines = doc.splitTextToSize(encouragingRewrite.textContent, 180);
  lines.forEach((line) => {
    yPos += 6;
    doc.text(line, 10, yPos);
  });
  yPos += 10;

  // Practical Advice
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Practical Advice:", 10, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const adviceContent = Array.from(practicalAdvice.querySelectorAll("li")).map(li => li.textContent).join("\n");
  lines = doc.splitTextToSize(adviceContent, 180);
  lines.forEach((line) => {
    yPos += 6;
    doc.text(line, 10, yPos);
  });
  doc.save("life_story.pdf");
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: Initialization on Page Load
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  displayQuestion();
  warmUpAPI(); // Optionally warm up your backend
});

// Switch language logic
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "he" : "en";
  languageToggle.textContent = currentLanguage === "en" ? "He" : "En";
  document.body.style.direction = currentLanguage === "he" ? "rtl" : "ltr";
  selectedAnswers = [];
  currentQuestionIndex = 0;
  displayQuestion();
});
