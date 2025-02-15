// Version 3.4 - Improved Post-Processing for Insight Agent 1, Refining Practical Advice, & Ensuring PDF Download

// 🟢 SECTION 1: Initialization & Global Variables
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
const practicalAdviceHeading = document.getElementById("practical-advice-heading");
const encouragingRewriteHeading = document.querySelector("#result-container h2:nth-of-type(2)");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");
const loadingContainer = document.getElementById("loading-container");

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// Ensure `questions.js` is loaded correctly
if (typeof questions === "undefined") {
    console.error("❌ Questions file not loaded! Check if `questions.js` is properly linked in `index.html`.");
}

// Hide elements initially
downloadButton.style.display = "none";
practicalAdvice.style.display = "none";
practicalAdviceHeading.style.display = "none";
encouragingRewriteHeading.style.display = "none";

// 🟢 SECTION 2: Fetch Insights from ChatGPT
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
                    storySummary: "Summarize the user's answers objectively without encouragement. Use only second-person ('you', 'your') without phrases like 'questionnaire answers provided' or 'this user'. It must begin exactly with: 'Based on your answers, you have' followed by a clear, factual summary.",
                    encouragingRewrite: "Rewrite the user's life story with a supportive, empowering tone. Use only second-person language. Begin with: 'Here's a new way to view your story in an empowering light: You navigate...' and provide an uplifting, realistic perspective.",
                    practicalAdvice: "Provide 3-5 specific, actionable steps the user can take to improve their life and perception of it. The advice must be truly practical (e.g., 'Call an old friend' instead of vague phrases like 'Embrace change'). The first sentence must not be a bullet point."
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

// 🟢 SECTION 3: Display Questions
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

// 🟢 SECTION 4: Handle Answer Selection
function handleAnswer(selectedButton, selectedIndex) {
    document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
    selectedButton.classList.add("selected");
    selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
    nextButton.disabled = false;
}

// 🟢 SECTION 5: Move to Next Question
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions[currentLanguage].length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showResults();
    }
});

// 🟢 SECTION 6: Show Results (Step-by-Step Insights)
async function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";

    // Fetch "Your Life Story" Insight
    loadingContainer.style.display = "block";
    const insights = await getInsightsFromChatGPT(selectedAnswers, false, "Your Life Story");
    loadingContainer.style.display = "none";

    if (insights?.storySummary) {
        let summary = insights.storySummary;
        // Remove unwanted phrases and duplicate prefixes
        summary = summary.replace(/Based on (the questionnaire answers provided|the answers provided),/gi, "");
        summary = summary.replace(/\byou's\b/gi, "you");
        summary = summary.trim();
        // Ensure the summary starts exactly as desired:
        if (!/^Based on your answers, you have/i.test(summary)) {
            summary = "Based on your answers, you have " + summary;
        }
        // Remove duplicate starting phrases if they occur
        summary = summary.replace(/(Based on your answers, you have\s*){2,}/i, "Based on your answers, you have ");
        storySummary.textContent = summary;
    } else {
        storySummary.textContent = currentLanguage === "en" ? "No summary available." : "אין סיכום זמין.";
    }

    // Fetch "Encouraging Rewrite" Insight
    setTimeout(async () => {
        encouragingRewriteHeading.style.display = "block";
        loadingContainer.style.display = "block";
        const rewriteInsights = await getInsightsFromChatGPT(selectedAnswers, false, "Encouraging Rewrite");
        loadingContainer.style.display = "none";
        if (rewriteInsights?.encouragingRewrite) {
            let rewriteText = rewriteInsights.encouragingRewrite;
            rewriteText = rewriteText.replace(/This user|The user|they/gi, "you");
            encouragingRewrite.textContent = rewriteText;
        } else {
            encouragingRewrite.textContent = currentLanguage === "en" ? "No rewritten version available." : "אין גרסה מחודשת זמינה.";
        }
        setTimeout(() => {
            downloadButton.style.display = "block";
        }, 500);
    }, 1500);
}

// 🟢 SECTION 7: Fetch Practical Advice & Fix Formatting
adviceButton.addEventListener("click", async () => {
    practicalAdvice.style.display = "block";
    practicalAdviceHeading.style.display = "block";
    adviceButton.style.display = "none";
    loadingContainer.style.display = "block";
    const insights = await getInsightsFromChatGPT(selectedAnswers, true, "Practical Advice");
    loadingContainer.style.display = "none";
    if (insights?.practicalAdvice && insights.practicalAdvice.length > 0) {
        // Limit to 3-5 items
        const adviceList = insights.practicalAdvice.slice(0, 5);
        const formattedAdvice = adviceList.map((advice, index) => {
            if (index === 0) {
                // Ensure the first advice is personal and not in bullet format.
                return `<strong>${advice.replace(/This individual has/gi, "You have").replace(/^[•\d\.\s]*/, "").trim()}</strong>`;
            } else {
                // Format subsequent advice as list items without extra numbering or bullet points.
                return `<li>${advice.replace(/^(\d+\.\s*)/, "").trim()}</li>`;
            }
        }).join("");
        practicalAdvice.innerHTML = formattedAdvice;
    } else {
        practicalAdvice.innerHTML = currentLanguage === "en" ? "<li>No practical advice available.</li>" : "<li>אין עצות מעשיות זמינות.</li>";
    }

    // Prepare updated PDF content including practical advice
    const pdfContent = `${currentLanguage === "en" ? "Your Life Story:" : "סיפור חייך:"}
${storySummary.textContent}

${currentLanguage === "en" ? "Encouraging Rewrite:" : "שכתוב מעודד:"}
${encouragingRewrite.textContent}

${currentLanguage === "en" ? "Practical Advice:" : "עצות מעשיות:"}
${Array.from(practicalAdvice.querySelectorAll("li")).map(li => li.textContent).join("\n")}`;

    downloadButton.onclick = () => downloadAsPDF(pdfContent);
});

// 🟢 SECTION 8: Ensure PDF Download Works
downloadButton.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const content = [
        "Your Life Story",
        storySummary.textContent,
        "",
        "Encouraging Rewrite",
        encouragingRewrite.textContent,
        "",
        "Practical Advice",
        Array.from(practicalAdvice.querySelectorAll("li")).map(li => li.textContent).join("\n")
    ].join("\n");
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save("life_story.pdf");
});

// 🟢 SECTION 9: Start Quiz on Page Load
document.addEventListener("DOMContentLoaded", displayQuestion);
