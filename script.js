// Version 1 - Updated script.js (Now Loads Questions Externally)

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
const loadingSpinner = document.getElementById("loading-spinner");

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// Ensure questions.js is loaded
if (typeof questions === "undefined") {
  console.error("❌ Questions file not loaded!");
}

function displayQuestion() {
    if (!questions[currentLanguage] || currentQuestionIndex >= questions[currentLanguage].length) {
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

function handleAnswer(selectedButton, selectedIndex) {
    document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
    selectedButton.classList.add("selected");
    selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex].options[selectedIndex];
    nextButton.disabled = false;
}

nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    displayQuestion();
});

languageToggle.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "he" : "en";
    languageToggle.textContent = currentLanguage === "en" ? "He" : "En";
    document.body.style.direction = currentLanguage === "he" ? "rtl" : "ltr";
    selectedAnswers = [];
    currentQuestionIndex = 0;
    displayQuestion();
});

async function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";
    adviceButton.style.display = "inline-block";
    loadingSpinner.style.display = "flex";

    const insights = await getInsightsFromChatGPT(selectedAnswers, false);
    loadingSpinner.style.display = "none";
    storySummary.textContent = insights.storySummary || "No summary available.";
    encouragingRewrite.textContent = insights.encouragingRewrite || "No rewritten version available.";
    practicalAdvice.innerHTML = insights.practicalAdvice ? insights.practicalAdvice.map(advice => `<li>${advice}</li>`).join("") : "<li>No practical advice available.</li>";

    downloadButton.style.display = "block";
}

async function getInsightsFromChatGPT(answers, includeAdvice) {
    try {
        const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: currentLanguage, answers, includeAdvice })
        });
        return await response.json();
    } catch (error) {
        console.error("Network error:", error);
        return { storySummary: "Error generating story summary.", encouragingRewrite: "Error generating encouraging rewrite.", practicalAdvice: ["Error generating practical advice."] };
    }
}

function downloadAsPDF(content) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save("life_story.pdf");
}

displayQuestion();
