import React from 'react';
import Card from '../components/Common/Card';

const ReportsPage = () => {
  return (
    <main className="p-4 max-w-7xl mx-auto w-full mt-4 flex-grow">
      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reports</h2>
        <p className="text-gray-600">
          This section will contain various custom reports and analytics.
          You can integrate charting libraries (e.g., Chart.js, Recharts) here.
        </p>
        <div className="mt-6 p-4 border rounded-md border-dashed border-gray-300 text-gray-500 text-center">
          <p>Coming Soon: Advanced Reporting Features!</p>
        </div>
      </Card>
    </main>
  );
};

export default ReportsPage;
