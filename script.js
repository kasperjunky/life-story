const questions = [
  {
    question: "What are your earliest memories of feeling safe and cared for?",
    options: [
      "I always felt safe and loved.",
      "I felt safe most of the time.",
      "I sometimes felt safe but often uncertain.",
      "I rarely felt safe or cared for.",
      "I never felt safe or cared for.",
    ],
  },
  {
    question: "How did you feel about yourself as a teenager?",
    options: [
      "Confident and self-assured.",
      "Generally okay, with occasional self-doubt.",
      "Insecure and unsure of myself.",
      "I struggled with my self-worth.",
      "I avoided thinking about myself.",
    ],
  },
];

let currentQuestionIndex = 0;
const selectedAnswers = [];

// DOM elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");

// Display the current question
function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";

  // Disable the "Next" button initially
  nextButton.disabled = true;

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.onclick = () => handleAnswer(button, index);
    optionsContainer.appendChild(button);
  });
}

// Handle answer selection and enable the "Next" button
function handleAnswer(selectedButton, selectedIndex) {
  const allButtons = document.querySelectorAll(".option-button");
  allButtons.forEach((button) => button.classList.remove("selected"));

  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] = questions[currentQuestionIndex].options[selectedIndex];
  nextButton.disabled = false;
}

// Move to the next question or show results
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    showResults();
  }
});

// Get insights from ChatGPT through the backend
async function getInsightsFromChatGPT(answers) {
  try {
    const response = await fetch(
      "https://interactive-backend.onrender.com/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant. Based on the answers provided, return:
1. A natural-language summary of the user’s life story (heading: "Your Life Story").
2. A rewritten, positive, and empowering version of the story (heading: "Rewrite Your Story").
3. Practical steps the user can take to address gaps or challenges in their life story (heading: "Practical Suggestions").`,
            },
            {
              role: "user",
              content: `Here are the user's answers: ${answers.join(", ")}`,
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      return parseInsights(data.choices[0].message.content);
    } else {
      console.error("Backend API Error:", data);
      return {
        lifeStory: "Error: Unable to generate your life story.",
        rewriteStory: "Error: Unable to rewrite your story.",
        practicalSuggestions: "Error: Unable to provide suggestions.",
      };
    }
  } catch (error) {
    console.error("Network Error:", error);
    return {
      lifeStory: "Network error occurred. Please check your connection.",
      rewriteStory: "Network error occurred. Please check your connection.",
      practicalSuggestions: "Network error occurred. Please check your connection.",
    };
  }
}

// Parse ChatGPT response into structured insights
function parseInsights(responseText) {
  const lifeStoryMatch = responseText.match(/Your Life Story:\s*(.+?)(?=Rewrite Your Story:|$)/s);
  const rewriteStoryMatch = responseText.match(/Rewrite Your Story:\s*(.+?)(?=Practical Suggestions:|$)/s);
  const practicalSuggestionsMatch = responseText.match(/Practical Suggestions:\s*(.+)$/s);

  return {
    lifeStory: lifeStoryMatch ? lifeStoryMatch[1].trim() : "No summary provided.",
    rewriteStory: rewriteStoryMatch ? rewriteStoryMatch[1].trim() : "No rewrite provided.",
    practicalSuggestions: practicalSuggestionsMatch ? practicalSuggestionsMatch[1].trim() : "No suggestions provided.",
  };
}

// Show results with structured insights
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  storySummary.innerHTML = "<p>Generating insights... Please wait.</p>";
  const insights = await getInsightsFromChatGPT(selectedAnswers);
  storySummary.innerHTML = `
    <h2>Your Life Story</h2>
    <p>${insights.lifeStory}</p>
    <h2>Rewrite Your Story</h2>
    <p>${insights.rewriteStory}</p>
    <h2>Practical Suggestions</h2>
    <p>${insights.practicalSuggestions}</p>
  `;
}

// Initialize the first question
displayQuestion();
