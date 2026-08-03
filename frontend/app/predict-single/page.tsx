'use client';

import  Layout  from '@/app/components/Layout';
import SinglePredictForm from '@/app/components/SinglePredictForm';

export default function SinglePredictPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
        <SinglePredictForm />
      </div>
    </Layout>
  );
}