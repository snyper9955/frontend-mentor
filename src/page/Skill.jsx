import React, { useState } from "react";

const skills = [
  "Web Development",
  "Video Editing",
  "Graphic Design",
  "Generative AI",
  "AI / ML",
];

const SkillLayout = () => {
  const [activeSkill, setActiveSkill] = useState("Web Development");

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-800 border-r border-neutral-700 p-6 hidden md:block">
        <h2 className="text-lg font-semibold mb-6">Skills</h2>
        <ul className="space-y-3">
          {skills.map((skill, index) => (
            <li
              key={index}
              onClick={() => setActiveSkill(skill)}
              className={`cursor-pointer px-3 py-2 rounded-lg transition ${
                activeSkill === skill
                  ? "bg-white text-black"
                  : "hover:bg-neutral-700"
              }`}
            >
              {skill}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-4">{activeSkill}</h1>

        <p className="text-neutral-400 mb-6">
          Structured roadmap, strategy, notes, quizzes & projects for{" "}
          {activeSkill}.
        </p>

        {/* Roadmap Section */}
        <div className="bg-neutral-800 p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">📍 Roadmap</h2>
          <ul className="space-y-2 text-neutral-300">
            <li>✔ Beginner Fundamentals</li>
            <li>✔ Intermediate Projects</li>
            <li>✔ Advanced Concepts</li>
            <li>✔ Real-world Implementation</li>
          </ul>
        </div>

        {/* Modules Section */}
        <div className="bg-neutral-800 p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">📚 Modules</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-neutral-700 p-4 rounded-xl">
              <div>
                <h4 className="font-medium">Introduction</h4>
                <p className="text-sm text-neutral-400">
                  Theory + Visual + Quiz
                </p>
              </div>
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition">
                Start
              </button>
            </div>

            <div className="flex justify-between items-center bg-neutral-700 p-4 rounded-xl">
              <div>
                <h4 className="font-medium">Core Concepts</h4>
                <p className="text-sm text-neutral-400">
                  Deep dive learning
                </p>
              </div>
              <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition">
                Continue
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SkillLayout;