import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateComplianceTest, createComplianceTest } from "../../api/complianceAPI";

const Steps = [
  { id: 1, title: "Basic Info", description: "Test title and source files" },
  { id: 2, title: "Audience", description: "Who should take this test" },
  { id: 3, title: "Schedule", description: "Set the test due date" },
  { id: 4, title: "Review", description: "Review and finalize questions" },
];

const Audience = ["All Employees", "Managers", "Finance Department", "New Hires"];

function ComplySyncForm({ onBackToDashboard, hideBackButton = false }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    driveFileNames: "",
    numQuestions: 5,
    audience: "",
    dueDate: "",
  });
  const [questions, setQuestions] = useState([]);

  const updateTestData = (field, value) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
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

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      // Get all necessary data from state
      const { title, numQuestions, driveFileNames } = testData;
      
      const data = await generateComplianceTest({
        numQuestions,
        topic: title,
        // ✅ FIXED: Now correctly sends the file names to the backend
        driveFileNames: driveFileNames ? driveFileNames.split(',').map(name => name.trim()) : [],
      });

      const newQuestions = data.questions.map((q, i) => ({
        id: Date.now() + i,
        question: q.question,
        options: q.options,
        answer: q.answer,
        required: true,
      }));

      setQuestions(newQuestions);
    } catch (err) {
      console.error("Failed to fetch questions:", err);
      setError("Failed to generate questions. Please check the backend.");
    } finally {
      setLoading(false);
    }
  };
  
  const validateStep = (step) => {
    const { title, numQuestions, audience, dueDate } = testData;
    switch (step) {
      case 1:
        // ✅ FIXED: File names are now optional for validation
        return title.trim() !== "" && numQuestions > 0;
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
      // Get workspace from localStorage - check both possible keys for consistency
      const workspace = localStorage.getItem("enteredWorkspaceName") || localStorage.getItem("selectedWorkspace") || "default";
      
      const payload = {
        test: testData,
        questions: questions.map(({ id, ...rest }) => rest),
        workspacename: workspace,
      };

      await createComplianceTest(payload);
      setSuccess(true);
      
      // // Navigate to dashboard after 2 seconds
      // setTimeout(() => {
      //   navigateToDashboard();
      // }, 2000);
    } catch (err) {
      console.error("Failed to submit test:", err);
      setError("Failed to submit the test. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    // Generate questions when moving from step 1
    if (currentStep === 1) {
      await handleGenerateQuestions();
    }
    
    // Finalize and submit on the last step
    if (currentStep === 4) {
      await handleSubmit();
      return; // Stop after submission
    }
    
    // Move to the next step
    setCurrentStep((prev) => Math.min(Steps.length, prev + 1));
  };

  return (
    <div className="w-screen min-h-screen bg-gray-200">
      <header className="w-full sticky top-0 min-h-2/12 bg-white">
        <div className="relative flex items-center p-2 justify-center text-white" style={{backgroundColor: '#743799'}}>
          {!hideBackButton && (
            <>
              <button
                onClick={() => navigate(-1)}
                className="absolute left-4 p-2 hover:bg-black rounded-lg"
              >
                <ArrowLeft size={25} />
              </button>
              <button
                onClick={() => onBackToDashboard ? onBackToDashboard() : navigate('/compliance')}
                className="absolute left-16 p-2 hover:bg-black rounded-lg text-sm"
              >
                Dashboard
              </button>
            </>
          )}
          <div className="text-center">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-300">
              Create Compliance Test
            </h1>
            <p className="text-xs sm:text-md text-gray-400">
              Set up a new compliance test for your team
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
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {Steps[0].title}
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={testData.title}
                  onChange={(e) => updateTestData("title", e.target.value)}
                  placeholder="e.g., Data Privacy Compliance Test"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Drive File Names (Optional)
                </label>
                <input
                  type="text"
                  value={testData.driveFileNames}
                  onChange={(e) =>
                    updateTestData("driveFileNames", e.target.value)
                  }
                  placeholder="e.g., policy.pdf, guidelines.docx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                 <p className="text-xs text-gray-500 mt-1">
                  Enter file names separated by commas.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={testData.numQuestions}
                  onChange={(e) =>
                    updateTestData("numQuestions", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={1}
                  max={20}
                />
              </div>
            </>
          )}

          {currentStep === 2 && (
             <div>
               <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                 {Steps[1].title}
               </h2>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Target Audience *
               </label>
               <select
                 value={testData.audience}
                 onChange={(e) => updateTestData("audience", e.target.value)}
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

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {Steps[2].title}
              </h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Due Date *
              </label>
              <input
                type="date"
                value={testData.dueDate}
                onChange={(e) => updateTestData("dueDate", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                The test will automatically close on this date.
              </p>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Review Questions</h3>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                >
                  <Plus size={16} /> Regenerate
                </button>
              </div>

              {loading && <div className="text-center py-8 text-gray-500">Generating questions...</div>}
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
                      {q.options.map((option, i) => (
                        <input
                          key={i}
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[i] = e.target.value;
                            updateQuestion(q.id, "options", newOptions);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6">
            <button
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || loading}
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
                ? "Publish Test"
                : "Next"}
              {!loading && currentStep !== 4 && <ArrowRight size={16} />}
            </button>
          </div>

          {success && (
            <div className="text-green-600 text-sm text-center mt-4 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> Test published successfully! Redirecting to dashboard...
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

export default ComplySyncForm;
