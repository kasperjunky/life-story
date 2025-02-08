// Version 1.2 - Fixing PDF Button Display Timing

// Clear previous cache or local storage
function clearCache() {
  localStorage.clear();
  sessionStorage.clear();
}
clearCache();

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const encouragingRewrite = document.getElementById("encouraging-rewrite");
const practicalAdvice = document.getElementById("practical-advice");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");
const loadingContainer = document.getElementById("loading-container");

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// Ensure questions.js is loaded
if (typeof questions === "undefined") {
  console.error("❌ Questions file not loaded! Check if questions.js is properly linked in index.html");
}

async function getInsightsFromChatGPT(answers, includeAdvice) {
    try {
        console.log("📡 Sending request to API with answers:", answers);

        const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: currentLanguage, answers, includeAdvice })
        });

        console.log("✅ API response received:", response);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📜 Parsed JSON:", data);
        return data;
    } catch (error) {
        console.error("❌ Network error:", error);
        return { 
            storySummary: "⚠ Error generating story summary.", 
            encouragingRewrite: "⚠ No rewritten version available.", 
            practicalAdvice: [] 
        };
    }
}

// 🟢 FUNCTION TO DISPLAY RESULTS PAGE WITH LOADING ANIMATION
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";
  adviceButton.style.display = "inline-block";
  downloadButton.style.display = "none"; // Hide PDF button until insights are loaded

  loadingContainer.style.display = "block";
  try {
      const insights = await getInsightsFromChatGPT(selectedAnswers, false);
      console.log("📜 Insights received:", insights);
      loadingContainer.style.display = "none";
      
      if (insights.storySummary) {
        storySummary.textContent = insights.storySummary;
      }
      if (insights.encouragingRewrite) {
        encouragingRewrite.textContent = insights.encouragingRewrite;
      }

      downloadButton.style.display = "block"; // Show PDF button after insights are ready
  } catch (error) {
      console.error("❌ Error fetching insights:", error);
      loadingContainer.style.display = "none";
      storySummary.textContent = "⚠ Error fetching insights. Please try again.";
  }
}

// 🟢 INITIATING FIRST QUESTION
document.addEventListener("DOMContentLoaded", () => {
  if (typeof questions !== "undefined") {
    displayQuestion();
  } else {
    console.error("❌ Questions data is missing!");
  }
});
