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

// Display the current question
function displayQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";

  // Disable "Next" button initially
  nextButton.disabled = true;

  // Add options as buttons
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.onclick = () => handleAnswer(button, index); // Handle selection
    optionsContainer.appendChild(button);
  });
}

// Handle answer selection and enable the "Next" button
function handleAnswer(selectedButton, selectedIndex) {
  // Remove highlight from all buttons
  const allButtons = document.querySelectorAll(".option-button");
  allButtons.forEach((button) => button.classList.remove("selected"));

  // Highlight the chosen button
  selectedButton.classList.add("selected");

  // Save the selected answer
  selectedAnswers[currentQuestionIndex] = questions[currentQuestionIndex].options[selectedIndex];

  // Enable the "Next" button
  nextButton.disabled = false;
}

// Move to the next question or show results
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    displayQuestion(); // Show the next question
  } else {
    showResults(); // Show results when all questions are answered
  }
});

// Function to get insights from ChatGPT
async function getInsightsFromChatGPT(answers) {
  const apiKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual OpenAI API key
  const endpoint = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides deep insights about personal stories based on user answers to a questionnaire.",
          },
          {
            role: "user",
            content: `Here are the answers to the questionnaire: ${answers.join(
              ", "
            )}. Please provide detailed insights about this user's life story.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.choices[0].message.content; // ChatGPT's response
    } else {
      console.error("Error from OpenAI:", data);
      return "There was an error generating insights. Please try again later.";
    }
  } catch (error) {
    console.error("Network error:", error);
    return "Network error occurred. Please check your connection.";
  }
}

// Show results with insights from ChatGPT
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  // Show loading while fetching insights
  storySummary.textContent = "Generating insights... Please wait.";

  const insights = await getInsightsFromChatGPT(selectedAnswers);
  storySummary.textContent = `Here are your answers:\n${selectedAnswers.join(
    "\n"
  )}\n\nInsights:\n${insights}`;
}

// Initialize the first question
displayQuestion();
