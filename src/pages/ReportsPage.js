import React from 'react';
import Card from '../components/Common/Card';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Button from '../components/Common/Button'; // Added: Import Button component

const ReportsPage = ({ onMessage }) => {
  // In a real application, this page would fetch and display various reports.
  // For now, it serves as a placeholder.

  const [loading, setLoading] = React.useState(false); // Example loading state
  const [reportData, setReportData] = React.useState(null); // Example data state
  const [error, setError] = React.useState(null); // Example error state

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    onMessage("Fetching report data... (This is a placeholder page)", "info");
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setReportData({ message: "Report data would appear here!" });
      onMessage("Report data loaded successfully!", "success");
    } catch (err) {
      setError("Failed to load reports.");
      onMessage("Failed to load reports.", "error");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  return (
    <main className="p-4 max-w-7xl mx-auto w-full mt-4 flex-grow">
      <Card className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reports Overview</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
        {loading ? (
          <LoadingSpinner message="Loading reports..." />
        ) : (
          <div>
            <p className="text-gray-700">This page is a placeholder for various ad campaign reports.</p>
            <p className="text-gray-700 mt-2">Future reports could include performance trends, budget utilization, audience insights, etc.</p>
            {reportData && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-800">Sample Report Data:</h3>
                <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded mt-2">{JSON.stringify(reportData, null, 2)}</pre>
              </div>
            )}
            <Button
              onClick={fetchReports}
              className="mt-6 bg-blue-900 hover:bg-blue-800 text-white"
            >
              Refresh Reports
            </Button>
          </div>
        )}
      </Card>
    </main>
  );
};

export default ReportsPage;
