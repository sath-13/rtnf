import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { axiosSecureInstance } from "../../api/axios";
import { GENERATE_AI_QUESTIONS_SLUG, CREATE_SURVEY_SLUG } from "../../constants/Api_constants";

const Steps = [
  { id: 1, title: "Basic Info", description: "Survey title and category" },
  { id: 2, title: "Audience", description: "Who should take this survey" },
  { id: 3, title: "Schedule", description: "Set the survey close date" },
  { id: 4, title: "Review", description: "Review and finalize questions" },
];

const Categories = ["Team Culture", "Feedback", "Wellbeing", "Engagement"];
const Audience = ["All Employees", "Managers", "Remote Workers"];
const QsType = [
  { value: "emoji-scale", label: "Emoji Scale" },
  { value: "slider", label: "Slider" },
  { value: "toggle", label: "Toggle" },
  { value: "star-rating", label: "Star Rating" },
  { value: "radio-group", label: "Radio Group" },
  { value: "checkbox-group", label: "Checkbox Group" },
  { value: "open-ended", label: "Open Ended" },
];

function PulsesyncForm({prop,workspace}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [surveyData, setSurveyData] = useState({
    title: "",
    description: "",
    category: [],
    audience: "",
    dueDate: "",
  });
  const [questions, setQuestions] = useState([]);

  const updateSurveyData = (field, value) => {
    setSurveyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCategory = (category) => {
    setSurveyData((prev) => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(cat => cat !== category)
        : [...prev.category, category]
    }));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const deleteQuestion = (id) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const sanitizeJSON = (raw) => raw.replace(/```json|```/g, "").trim();

  const mapType = (type) => {
    const typeMap = {
      smiley: "emoji-scale",
      bar: "slider",
      text: "open-ended",
    };
    const lower = type.toLowerCase();
    return typeMap[lower] || QsType.find((t) => t.value === lower)?.value || "open-ended";
  };

  const handleAsk = useCallback(async (count = 1) => {
    setLoading(true);
    setError("");
    try {
      const prompt = `Give me ${count} pulse survey question${count > 1 ? "s" : ""} and a recommended question type (emoji-scale, slider, toggle, star-rating, radio-group, checkbox-group, open-ended) for the topic "${surveyData.title}" for each category from "${surveyData.category}". Respond ${
        count > 1 ? "with a JSON array" : "as JSON"
      } like this: ${
        count > 1
          ? '[{ "question": "...", "type": "...", "category": "..." }]'
          : '{ "question": "...", "type": "..." , "category": "..." }'
      }`;

      const { data } = await axiosSecureInstance.post(GENERATE_AI_QUESTIONS_SLUG(), {
        message: prompt,
      });
      console.log(surveyData.category)
      console.log(prompt)
      console.log(data)
      const parsed = JSON.parse(sanitizeJSON(data.reply));
      const newQuestions = Array.isArray(parsed) ? parsed : [parsed];

      setQuestions((prev) => [
        ...prev,
        ...newQuestions.map((q, i) => ({
          id: Date.now() + i,
          question: q.question || "",
          category: q.category || "",
          type: mapType(q.type),
          required: true,
        })),
      ]);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setError("Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  }, [surveyData.title, surveyData.category]);

  useEffect(() => {
    if (currentStep === 4 && questions.length === 0) {
      handleAsk(5);
    }
  }, [currentStep, questions.length, handleAsk]);

  const validateStep = (step) => {
    const { title, category, audience, dueDate } = surveyData;
    switch (step) {
      case 1:
        return title.trim() !== "" && category.length > 0;
      case 2:
        return audience;
      case 3:
        return dueDate && new Date(dueDate) > new Date();
      case 4:
        return questions.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const payload = {
        survey: surveyData,
        workspace: workspace?.workspacename,
        questions: questions.map(({ question, category, type, required }) => ({
          question,
          category,
          questionType: type,
          skipped: !required,
        })),
      };

      const res = await axiosSecureInstance.post(CREATE_SURVEY_SLUG(), payload);
      console.log("Survey published:", res.data);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit survey:", err);
      setError("Failed to submit survey.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 4) {
      await handleSubmit();
    } else {
      setCurrentStep((prev) => Math.min(Steps.length, prev + 1));
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gray-200">
      <header className="w-full sticky top-0 min-h-2/12 bg-white">
        <div className="relative flex items-center p-2 justify-center text-white" style={{backgroundColor: '#743799'}}>
          <button
            onClick={() =>prop(false)}
            className="absolute left-4 p-2 hover:bg-black rounded-lg"
          >
            <ArrowLeft size={25} />
          </button>
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-300">
              Create Survey
            </h1>
            <p className="text-xs sm:text-md text-gray-400">
              workspace: <b>{workspace.workspacename}</b>
            </p>
            <p className="text-xs sm:text-md text-gray-400">
              Set up a new pulse survey for your team
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center p-2">
          {Steps.map((e) => (
            <div key={e.id} className="flex items-center px-1 py-2 sm:m-3">
              <div
                className={`${
                  currentStep === e.id
                    ? "bg-blue-700 text-white"
                    : "bg-gray-300 text-gray-600"
                } w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center`}
              >
                {e.id}
              </div>
              <div className="pl-2">
                <h1 className="font-bold text-sm sm:text-base">{e.title}</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {e.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <main className="w-full min-h-9/12 flex items-center bg-gray-200 justify-center px-4 py-6">
        <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-6 space-y-6 shadow-gray-300">
          {/* Step 1 */}
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {Steps[0].title}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Survey Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={surveyData.title}
                  onChange={(e) => updateSurveyData("title", e.target.value)}
                  placeholder="e.g., Q4 Employee Satisfaction Survey"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={surveyData.description}
                  onChange={(e) =>
                    updateSurveyData("description", e.target.value)
                  }
                  placeholder="Brief description (optional)"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={500}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {Categories.map((category) => (
                    <label key={category} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={surveyData.category.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {Steps[1].title}
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience *
              </label>
              <select
                value={surveyData.audience}
                onChange={(e) => updateSurveyData("audience", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select target audience...</option>
                {Audience.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {Steps[2].title}
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Close Date *
              </label>
              <input
                type="date"
                value={surveyData.dueDate}
                onChange={(e) => updateSurveyData("dueDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Survey will automatically close on this date
              </p>
            </div>
          )}

          {/* Step 4: Review + Questions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">Survey Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(surveyData).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium capitalize">{key}:</span>
                      <p className="text-gray-700">
                        {key === 'category' && Array.isArray(value) 
                          ? value.length > 0 ? value.join(', ') : 'Not set'
                          : value || "Not set"
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">Survey Questions</h3>
                  <button
                    onClick={() => handleAsk(1)}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    <Plus size={16} /> Add Question
                  </button>
                </div>

                {!loading && questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions generated yet.
                  </div>
                )}

                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div
                      key={q.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <button
                          onClick={() => deleteQuestion(q.id)}
                          className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <textarea
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(q.id, "question", e.target.value)
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={q.category}
                            onChange={(e) =>
                              updateQuestion(q.id, "category", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {Categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>

                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(q.id, "type", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            {QsType.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={!q.required}
                            onChange={(e) =>
                              updateQuestion(q.id, "required", !e.target.checked)
                            }
                            className="rounded border-gray-300 focus:ring-blue-500"
                          />
                          Make this question optional
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep) || loading}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                !validateStep(currentStep) || loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : currentStep === 4
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading
                ? "Processing..."
                : currentStep === 4
                ? "Publish Survey"
                : "Next"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>

          {success && (
            <div className="text-green-600 text-sm text-center mt-4 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Survey published successfully!
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm text-center mt-4 flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PulsesyncForm;
