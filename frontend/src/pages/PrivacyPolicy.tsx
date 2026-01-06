import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-sm mb-6 text-gray-500">Effective Date: June 8, 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <p>
          When you log in with Roblox OAuth2, we collect your Roblox user ID, username, and group role. We do not
          collect your password or other sensitive information.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Use of Information</h2>
        <p>
          We use your Roblox account data to verify your access level (e.g., staff or public) and allow scheduling or
          viewing of events.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
        <p>
          We do not sell or share your data with third parties. Your information is only used within this application
          for scheduling and group management purposes.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Cookies & Tracking</h2>
        <p>
          This site may use minimal session-based cookies to manage authentication. We do not use tracking cookies or
          third-party analytics.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Data Storage & Security</h2>
        <p>
          All data is securely stored using industry-standard practices. Your Roblox ID is used internally for
          scheduling and accountability.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
        <p>
          If you have any concerns about this policy, please reach out to the Serendipity Support Center group
          leadership through Roblox or Discord.
        </p>
      </section>
    </main>
  );
};

export default PrivacyPolicy;
