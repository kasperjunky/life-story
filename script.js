const questions = [
  {
    question: "What are your earliest memories of feeling safe and cared for?",
    options: [
      "I always felt safe and loved.",
      "I felt safe most of the time.",
      "I sometimes felt safe but often uncertain.",
      "I rarely felt safe or cared for.",
      "I never felt safe or cared for."
    ]
  },
  {
    question: "How did you feel about yourself as a teenager?",
    options: [
      "Confident and self-assured.",
      "Generally okay, with occasional self-doubt.",
      "Insecure and unsure of myself.",
      "I struggled with my self-worth.",
      "I avoided thinking about myself."
    ]
  },
  {
    question: "How would you describe your relationships with your friends?",
    options: [
      "I have deep, meaningful friendships.",
      "I have some close friends, but not many.",
      "I have mostly casual friendships.",
      "I struggle to maintain friendships.",
      "I feel isolated and without close friends."
    ]
  },
  {
    question: "What do you feel you don’t have enough of in life?",
    options: [
      "Love and connection.",
      "Someone who truly cares for me.",
      "Confidence or self-esteem.",
      "Purpose or direction.",
      "Peace and emotional stability."
    ]
  },
  {
    question: "Do you feel comfortable with new experiences?",
    options: [
      "Yes, I love trying new things.",
      "I enjoy new experiences but need time to adjust.",
      "I feel hesitant but eventually try them.",
      "I avoid new experiences whenever possible.",
      "I’m fearful and rarely try new things."
    ]
  }
];

let currentQuestionIndex = 0;
const selectedAnswers = [];

// DOM elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const lifeStoryHeading = document.getElementById("life-story-heading");
const encouragingRewriteHeading = document.getElementById("encouraging-rewrite-heading");
const practicalAdviceHeading = document.getElementById("practical-advice-heading");

// Display the current question
function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
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
  const allButtons = document.querySelectorAll(".option-button");
  allButtons.forEach((button) => button.classList.remove("selected"));
  selectedButton.classList.add("selected");

  selectedAnswers[currentQuestionIndex] = questions[currentQuestionIndex].options[selectedIndex];
  nextButton.disabled = false;
}

// Navigate to the next question or show results
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion();
  } else {
    showResults();
  }
});

// Fetch insights from the backend
async function getInsightsFromChatGPT(answers) {
  try {
    const response = await fetch('https://interactive-backend.onrender.com/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. Provide three sections: (1) a life story summary, (2) an encouraging rewrite, and (3) practical advice for improvement.',
          },
          {
            role: 'user',
            content: `Here are the user's answers: ${answers.join(', ')}. Create the response.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.choices[0].message.content;
    } else {
      console.error('Backend API Error:', data.error);
      return 'Error: Unable to generate insights.';
    }
  } catch (error) {
    console.error('Network Error:', error);
    return 'Network error occurred. Please check your connection.';
  }
}

// Show results with insights
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  storySummary.textContent = "Generating insights... Please wait.";

  const insights = await getInsightsFromChatGPT(selectedAnswers);

  // Display sections
  storySummary.innerHTML = insights;
  lifeStoryHeading.style.display = "block";
  encouragingRewriteHeading.style.display = "block";
  practicalAdviceHeading.style.display = "block";
}

// Initialize the questionnaire
displayQuestion();
