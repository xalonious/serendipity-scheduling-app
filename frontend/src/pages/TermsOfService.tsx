import React from 'react';

const TermsOfService: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-sm mb-6 text-gray-500">Effective Date: June 8, 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          Welcome to the official scheduling platform for Serendipity Support Center, a Roblox roleplay group. By
          accessing or using this site, you agree to be bound by these Terms of Service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Use of the Platform</h2>
        <p>
          Our platform allows staff members to log in via Roblox OAuth2 to schedule and claim shifts and training
          sessions. Public users can view scheduled events but cannot interact with them.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Only claim sessions you intend to attend.</li>
          <li>Follow Roblox Community Standards while using this site.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Access & Termination</h2>
        <p>
          Your access is based on your verified Roblox account and group roles. We reserve the right to suspend access
          for any user who misuses the platform or violates these terms.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Modifications</h2>
        <p>
          We may modify these Terms at any time. Continued use after changes indicates acceptance of the new terms.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
        <p>
          For questions about these Terms, please contact the Serendipity Support Center group owner or a web
          administrator via Roblox or Discord.
        </p>
      </section>
    </main>
  );
};

export default TermsOfService;
