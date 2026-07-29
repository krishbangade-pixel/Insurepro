'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Agent Policies page — shows all policies the agent manages.
 * For now, redirects to agent dashboard which has a policy summary.
 * Can be expanded into a full policies table view.
 */
export default function AgentPoliciesPage() {
  const router = useRouter();
  useEffect(() => {
    // Redirect to agent dashboard which shows policy stats
    // Replace with a full policies table if needed
    router.replace('/agent/dashboard');
  }, [router]);
  return null;
}
