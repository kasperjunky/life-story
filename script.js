// Version 2.0 - Fixing "Your Life Story" Pronouns

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
const practicalAdviceHeading = document.querySelector("#result-container h2:nth-of-type(3)");
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

// Hide elements initially
downloadButton.style.display = "none";
practicalAdvice.style.display = "none";
practicalAdviceHeading.style.display = "none";

// 🟢 FUNCTION TO FETCH INSIGHTS FROM API WITH CUSTOM PROMPTS
async function getInsightsFromChatGPT(answers, includeAdvice) {
    try {
        console.log("📡 Sending request to API with answers:", answers);

        const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                language: currentLanguage, 
                answers, 
                includeAdvice,
                prompts: {
                    storySummary: "Analyze the user's responses and generate a narrative summary about their life. The response **must always use second-person ('you', 'your')** instead of third-person ('the user', 'they'). Start with: 'Based on the answers provided, your life story is one of...' and ensure a direct, engaging tone. Avoid any use of 'you's' (incorrect grammar).",
                    encouragingRewrite: "Rewrite the user's life story with a supportive, empowering tone. The response **must be in the second person ('you')** instead of third person ('this individual' or 'they'). Start with: 'Here's a new way to view your story in an empowering light: You navigate...' and ensure an uplifting but realistic tone.",
                    practicalAdvice: "Based on the user's responses, provide 3-5 specific, actionable steps they can take to improve their situation. Advice should be realistic, practical, and solution-oriented."
                }
            })
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

// 🟢 FUNCTION TO DISPLAY RESULTS & CONTROL PDF BUTTON
async function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";
    adviceButton.style.display = "inline-block";
    downloadButton.style.display = "none";

    loadingContainer.style.display = "block";
    try {
        const insights = await getInsightsFromChatGPT(selectedAnswers, false);
        console.log("📜 Insights received:", insights);
        loadingContainer.style.display = "none";
        
        if (insights.storySummary) {
            storySummary.textContent = insights.storySummary
                .replace(/\byou's\b/g, "your") // Fix incorrect possessive form
                .replace(/\bthey\b/g, "you") // Force second-person pronouns
                .replace(/^Based on the answers provided, you's/, "Based on the answers provided, your") // Fixes wrong possessive
                .replace(/^Based on the answers provided, your life story can/, "Based on the answers provided, your life story is"); // Ensures consistency
        }
    } catch (error) {
        console.error("❌ Error fetching insights:", error);
        loadingContainer.style.display = "none";
        storySummary.textContent = "⚠ Error fetching insights. Please try again.";
    }
}
