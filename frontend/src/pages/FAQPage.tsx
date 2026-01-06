import React from "react";
import Header from "../components/Header";

const FAQPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary-bg)]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          Frequently Asked Questions
        </h1>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            Rank and Trainings Questions
          </h2>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              How can I work here?
            </h3>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
              <li>First, you’ll need to join the group.</li>
              <li>Complete the application in the Application Center.</li>
              <li>
                If you pass, you’ll be ranked Receptionist. Receptionist+ can
                give cards.
              </li>
              <li>
                Once you are a Receptionist, attend and pass Receptionist
                Training to become a Junior Counselor. Junior Counselor+ can do
                sessions.
              </li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              EST is not my time zone, when are Receptionist training sessions
              hosted in my time zone?
            </h3>
            <p className="mt-2 text-gray-600">
              You can convert EST to your time zone.
            </p>
            <table className="table-auto w-full text-left border-collapse mt-2 text-gray-600">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">PST</th>
                  <th className="px-4 py-2 border">CST</th>
                  <th className="px-4 py-2 border">BST</th>
                  <th className="px-4 py-2 border">AEST</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["9 am", "11 am", "5 pm", "2 am"],
                  ["12 pm", "2 pm", "8 pm", "5 am"],
                  ["2 pm", "4 pm", "10 pm", "7 am"],
                  ["5 pm", "7 pm", "1 am", "10 am"],
                  ["7 pm", "9 pm", "3 am", "12 pm"],
                  ["9 pm", "11 pm", "5 am", "2 pm"],
                  ["3 am", "5 am", "11 am", "8 pm"],
                  ["6 am", "8 am", "2 pm", "11 pm"],
                ].map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 border">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              When is the next Receptionist training?
            </h3>
            <p className="mt-2 text-gray-600">
              Check our{" "}
              <a
                href="https://rbxserendipity.com/trainings"
                className="text-blue-600 hover:underline"
              >
                Weekly Training Schedule
              </a>
              .
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              What time should I join the training center?
            </h3>
            <p className="mt-2 text-gray-600">
              Join exactly at the listed training time. The server unlocks then,
              and no one can join early.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              I disconnected/left the training server, can I rejoin?
            </h3>
            <p className="mt-2 text-gray-600">
              Unfortunately no. You’ll need to attend another session.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              I am a different rank in-game than in Discord, how do I update my
              rank?
            </h3>
            <p className="mt-2 text-gray-600">
              Run <code className="bg-gray-100 px-1 py-0.5 rounded">/getrole</code>{" "}
              in <span className="font-mono">#bot-commands</span>.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">How can I become an MR?</h3>
            <p className="mt-2 text-gray-600">
              You need to be a Junior Specialist+. Then either:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
              <li>
                Be a Head Specialist, stay active in trainings/shifts, and
                earn a recommendation.
              </li>
              <li>
                Apply when MR Applications open, announced in{" "}
                <span className="font-mono">#announcements</span>.
              </li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              When are MR applications released?
            </h3>
            <p className="mt-2 text-gray-600">
              Applications open as needed (no fixed date). Watch{" "}
              <span className="font-mono">#announcements</span> for details.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              How can I help out at trainings?
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Head Advisor+ can spectate, backup, and train.</li>
              <li>Shift Assistant+ can PM attendees.</li>
              <li>Assistant Supervisor+ can co-host and rank.</li>
              <li>
                When a host posts in <span className="font-mono">#trainings</span>,{" "}
                DM them to request an available role.
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              I’ve been demoted but still have in-game points, how do I get my
              previous rank back?
            </h3>
            <p className="mt-2 text-gray-600">
              If you left the group, re-apply in the Application Center, pass
              the receptionist trainings, and complete one session.
            </p>
            <p className="mt-2 text-gray-600">
              Example: to regain Advisor status, follow those steps as before.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              Can I transfer my rank to another account?
            </h3>
            <p className="mt-2 text-gray-600">
              No, ranks cannot be transferred between accounts.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              How can I get the Star Staff role on Discord, and what are the
              benefits?
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Earn 1000 in-game points.</li>
              <li>Open a Medium Response ticket to request the role.</li>
              <li>
                Star Staff get a special icon and can pick their role display
                color.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            Alliance Questions
          </h2>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              Am I allowed to go on an alliance visit?
            </h3>
            <p className="mt-2 text-gray-600">
              You must be Junior Specialist+ and represent SSC professionally.
              See pins in{" "}
              <span className="font-mono">#alliance-photos</span> for details.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              How can I ally with Serendipity Support Center?
            </h3>
            <p className="mt-2 text-gray-600">
              Check the{" "}
              <a
                href="https://devforum.roblox.com/t/serendipity-support-clinic-handbook/3624038"
                className="text-blue-600 hover:underline"
              >
                Partnership Guide
              </a>{" "}
              for requirements and info.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
            Gamepass and Boost Questions
          </h2>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              How can I get a colorful nametag in-game?
            </h3>
            <p className="mt-2 text-gray-600">
              Purchase the Platinum Pass gamepass to receive a colorful
              nametag.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              I purchased the Instant Junior Counselor gamepass, can I be
              ranked?
            </h3>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
              <li>
                Open a Medium Response ticket and state you purchased the
                gamepass.
              </li>
              <li>
                Make your inventory public: in Roblox Settings → Privacy & content restrictions → Trading & Inventory →
                “Inventory visibility” → Everyone.
              </li>
            </ol>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              What are the benefits of being a Platinum Pass Member?
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>Colorful in-game nametag</li>
              <li>Faster service</li>
              <li>Special Discord role</li>
              <li>Picture permissions in Discord</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700">
              What are the benefits of boosting the server?
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
              <li>
                Exclusive Nitro channel (plus Booster-Only giveaways & game
                nights)
              </li>
              <li>Special pink booster role & icon</li>
              <li>Ability to change your server nickname</li>
              <li>Access to GIF emojis</li>
              <li>Choose from a variety of color roles</li>
              <li>Use external emojis & stickers</li>
              <li>Send images</li>
              <li>
                In-game booster tag (run{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                  /getboostertag
                </code>
                )
              </li>
            </ul>
          </div>
        </section>

        <p className="mt-8 text-gray-700">
          Can’t find an answer? Ask in{" "}
          <span className="font-mono">#serendipity-chat</span>, or open a Low
          Response ticket if it’s unanswered there.
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
