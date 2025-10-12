import React, { useState } from "react";

function FAQButtons({ sendMessage }) {
  const [activeCategory, setActiveCategory] = useState("General Information");
  
  const faqGroups = {
    "General Information": [
      "What is a clinical trial?",
      "Why is it called clinical trial?",
      "How many participants will be enrolled?",
      "Who regulates clinical trials?",
    ],
    "Participation": [
      "How do I benefit from participating?",
      "What are the trial procedures?",
      "Can I inform my family?",
      "What interventions are involved?",
    ],
    "Safety & Risks": [
      "What risks do I face?",
      "What if something goes wrong?",
      "Who provides medical care?",
      "How are side effects managed?",
    ],
    "Voluntary Participation": [
      "Can I refuse to participate?",
      "How do I withdraw from the trial?",
    ],
    "Costs & Compensation": [
      "Do I need to pay anything?",
      "What expenses are covered?",
      "What compensation is provided?",
    ],
    "Privacy": [
      "Is my data confidential?",
      "How is my information protected?",
    ],
  };

  return (
    <div className="h-full flex flex-col">
      
      {/* Category Tabs */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(faqGroups).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`p-3 text-xs font-medium rounded-lg transition-all ${
                activeCategory === category
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Questions for Active Category */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {faqGroups[activeCategory]?.map((question, index) => (
            <button
              key={index}
              onClick={() => sendMessage(question)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-sm leading-relaxed"
            >
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-medium text-xs mt-1">Q:</span>
                <span className="text-gray-700">{question}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          <button
            onClick={() => sendMessage("I need help understanding clinical trials")}
            className="w-full p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            💡 Get Started Guide
          </button>
          
          <button
            onClick={() => sendMessage("How can I contact someone for more information?")}
            className="w-full p-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
          >
            📞 Contact Support
          </button>
        </div>
      </div>

    </div>
  );
}

export default FAQButtons;
