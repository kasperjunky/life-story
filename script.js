// Version 1 - Fixing Advice Button & PDF Download

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

// 🟢 FUNCTION TO DISPLAY QUESTIONS
function displayQuestion() {
  if (!questions || !questions[currentLanguage] || currentQuestionIndex >= questions[currentLanguage].length) {
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

// 🟢 HANDLING ANSWER SELECTION
function handleAnswer(selectedButton, selectedIndex) {
  document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
  nextButton.disabled = false;
}

// 🟢 MOVING TO THE NEXT QUESTION OR RESULTS PAGE
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions[currentLanguage].length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    showResults();
  }
});

// 🟢 FUNCTION TO DISPLAY RESULTS PAGE
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";
  adviceButton.style.display = "inline-block";
  practicalAdvice.style.display = "none"; // Hide advice until button is clicked

  console.log("⏳ Fetching insights...");
  const insights = await getInsightsFromChatGPT(selectedAnswers, false);
  console.log("📜 Insights received:", insights);

  if (insights.storySummary) {
    storySummary.textContent = insights.storySummary;
  }
  if (insights.encouragingRewrite) {
    encouragingRewrite.textContent = insights.encouragingRewrite;
  }
}

// 🟢 FUNCTION TO FETCH ADVICE ONLY AFTER BUTTON CLICK
adviceButton.addEventListener("click", async () => {
    console.log("🔵 'Give me advice' button clicked");
    practicalAdvice.style.display = "block";
    practicalAdvice.textContent = "⏳ Fetching advice...";
    const insights = await getInsightsFromChatGPT(selectedAnswers, true);
    practicalAdvice.innerHTML = insights.practicalAdvice && insights.practicalAdvice.length > 0
        ? insights.practicalAdvice.map(advice => `<li>${advice}</li>`).join("")
        : "<li>⚠ No practical advice available.</li>";
    console.log("✅ Advice displayed successfully.");
    adviceButton.style.display = "none";
});

// 🟢 FUNCTION TO DOWNLOAD PDF
function downloadAsPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error("❌ jsPDF library is missing!");
        alert("PDF generation is not available. Please check the jsPDF library.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pdfContent = `Your Life Story:\n${storySummary.textContent}\n\nEncouraging Rewrite:\n${encouragingRewrite.textContent}\n\nPractical Advice:\n${practicalAdvice.innerText}`;

    const lines = doc.splitTextToSize(pdfContent, 180);
    doc.text(lines, 10, 10);
    doc.save("life_story.pdf");
}

downloadButton.addEventListener("click", downloadAsPDF);

// 🟢 INITIATING FIRST QUESTION
document.addEventListener("DOMContentLoaded", () => {
  if (typeof questions !== "undefined") {
    displayQuestion();
  } else {
    console.error("❌ Questions data is missing!");
  }
});
