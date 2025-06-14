import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatCurrency, truncateText, getCostMetricLabel } from '../utils/helpers'; // Ensure getCostMetricLabel is imported

// Use process.env to access the environment variable set in Cloudflare Pages.
// For Create React App, client-side environment variables must be prefixed with REACT_APP_.
// If REACT_APP_DATA_URL is not set, it will fall back to the default opensheet URL.
const DATA_URL = process.env.REACT_APP_DATA_URL || 'https://opensheet.elk.sh/1n66ctdtHrySM957k4TFRYfO6JRmJ9Y5oBGaIMS3g8PY/result';

const DashboardPage = ({ onMessage }) => {
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [campaignSearch, setCampaignSearch] = useState('');
  const [adsNameSearch, setAdsNameSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [objectiveFilter, setObjectiveFilter] = useState('All');
  const [deviceFilter, setDeviceFilter] = useState('All'); // Used for device filter
  const [segmentFilter, setSegmentFilter] = useState('All'); // Used for segment filter
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Sorting states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchAdsData = async () => {
      setLoading(true);
      setError(null);
      // Check if DATA_URL is defined before fetching
      if (!DATA_URL) {
        const errMsg = "DATA_URL environment variable is not defined. Please set REACT_APP_DATA_URL in Cloudflare Pages settings.";
        console.error(errMsg);
        setError(errMsg);
        onMessage(errMsg, "error");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const processedData = data.map(item => {
          const dateParts = item.Date?.split('/');
          const parsedDate = dateParts && dateParts.length === 3
            ? new Date(parseInt(dateParts[2], 10), parseInt(dateParts[0], 10) - 1, parseInt(dateParts[1], 10))
            : null; // Handle invalid date formats gracefully

          const impressions = parseInt(item.Impression?.replace(/,/g, '') || '0', 10);
          const clicks = parseInt(item.Click?.replace(/,/g, '') || '0', 10);
          const install = parseInt(item.Install || '0', 10);
          const follow = parseInt(item.Follow || '0', 10);
          const engagement = parseInt(item.Engagement?.replace(/,/g, '') || '0', 10);
          const spent = parseFloat(item.Spent?.replace(/,/g, '') || '0');
          const budget = parseFloat(item.Budget?.replace(/,/g, '') || '0');

          const calculatedCtr = impressions > 0 ? (clicks / impressions) * 100 : 0;

          let calculatedCostMetric = NaN;
          switch (item.Objective) {
            case 'Impression': calculatedCostMetric = impressions > 0 ? (spent / impressions) * 1000 : 0; break;
            case 'Click': calculatedCostMetric = clicks > 0 ? spent / clicks : 0; break;
            case 'Install': calculatedCostMetric = install > 0 ? spent / install : 0; break;
            case 'Engagement': calculatedCostMetric = engagement > 0 ? (spent / engagement) * 1000 : 0; break;
            default: calculatedCostMetric = NaN;
          }

          return {
            ...item,
            Date: parsedDate,
            Campaign: item['Core Campaign Name'],
            AdsName: item['Ads Campaign Name'],
            Impressions: impressions,
            Clicks: clicks,
            Install: install,
            Follow: follow,
            Engagement: engagement,
            Spent: spent,
            Budget: budget,
            CTR: calculatedCtr,
            Devices: item['Device Target'],
            Segment: item['Segment'],
            CostMetric: calculatedCostMetric,
          };
        }).filter(item => item.Date instanceof Date && !isNaN(item.Date.getTime())); // Filter out invalid dates
        setAdsData(processedData);
      } catch (e) {
        console.error("Failed to fetch ads data:", e);
        setError("Failed to load data. Please try again later.");
        onMessage("Failed to load data. Please try again later.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAdsData();
  }, [onMessage]);

  // Memoized unique filter options
  const uniquePlatforms = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Platform).filter(p => p && p !== 'All'))];
  }, [adsData]);

  const uniqueObjectives = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Objective).filter(o => o && o !== 'All'))];
  }, [adsData]);

  const uniqueDevices = useMemo(() => { // This will now be used in JSX
    return ['All', ...new Set(adsData.map(item => item.Devices).filter(d => d && d !== 'All'))];
  }, [adsData]);

  const uniqueSegments = useMemo(() => { // This will now be used in JSX
    return ['All', ...new Set(adsData.map(item => item.Segment).filter(s => s && s !== 'All'))];
  }, [adsData]);

  const filteredData = useMemo(() => {
    let currentData = [...adsData];

    if (campaignSearch) {
      currentData = currentData.filter(item =>
        item.Campaign?.toLowerCase().includes(campaignSearch.toLowerCase()) ||
        item.AdsName?.toLowerCase().includes(campaignSearch.toLowerCase())
      );
    }
    if (adsNameSearch) {
      currentData = currentData.filter(item =>
        item.AdsName?.toLowerCase().includes(adsNameSearch.toLowerCase())
      );
    }
    if (platformFilter !== 'All') {
      currentData = currentData.filter(item => item.Platform === platformFilter);
    }
    if (objectiveFilter !== 'All') {
      currentData = currentData.filter(item => item.Objective === objectiveFilter);
    }
    if (deviceFilter !== 'All') {
      currentData = currentData.filter(item => item.Devices === deviceFilter);
    }
    if (segmentFilter !== 'All') {
      currentData = currentData.filter(item => item.Segment === segmentFilter);
    }

    if (dateRange !== 'All') {
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      let filterStartDate = null;
      let filterEndDate = null;

      if (dateRange === 'Last 7 Days') {
        filterStartDate = new Date(now);
        filterStartDate.setDate(now.getDate() - 6);
        filterEndDate = new Date(now);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (dateRange === 'Last 30 Days') {
        filterStartDate = new Date(now);
        filterStartDate.setDate(now.getDate() - 29);
        filterEndDate = new Date(now);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (dateRange === 'Last Month') {
        filterStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filterEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        filterEndDate.setHours(23, 59, 59, 999);
      } else if (dateRange === 'Custom' && customStartDate && customEndDate) {
        filterStartDate = new Date(customStartDate);
        filterEndDate = new Date(customEndDate);
        filterEndDate.setHours(23, 59, 59, 999);
      }

      if (filterStartDate) filterStartDate.setHours(0, 0, 0, 0);


      if (filterStartDate && filterEndDate) {
        currentData = currentData.filter(item =>
          item.Date && item.Date.getTime() >= filterStartDate.getTime() && item.Date.getTime() <= filterEndDate.getTime()
        );
      }
    }
    return currentData;
  }, [adsData, campaignSearch, adsNameSearch, platformFilter, objectiveFilter, deviceFilter, segmentFilter, dateRange, customStartDate, customEndDate]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'Date') {
        aValue = a.Date ? a.Date.getTime() : 0;
        bValue = b.Date ? b.Date.getTime() : 0;
      } else if (['Impressions', 'Clicks', 'Install', 'Follow', 'Engagement', 'Spent', 'Budget', 'CTR', 'CostMetric'].includes(sortConfig.key)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableData;
  }, [filteredData, sortConfig]);

  // Pagination logic
  const pageCount = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, rowsPerPage]);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Summary Metrics Calculation (moved here for Dashboard display)
  const summaryMetrics = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalImpressions: 0, totalClicks: 0, totalInstall: 0, totalFollow: 0, totalEngagement: 0,
        totalSpent: 0, totalBudget: 0, cpm: 0, cpc: 0, cpi: 0, cpe: 0, ctr: 0,
      };
    }

    const totalImpressions = filteredData.reduce((sum, item) => sum + item.Impressions, 0);
    const totalClicks = filteredData.reduce((sum, item) => sum + item.Clicks, 0);
    const totalInstall = filteredData.reduce((sum, item) => sum + item.Install, 0);
    const totalFollow = filteredData.reduce((sum, item) => sum + item.Follow, 0);
    const totalEngagement = filteredData.reduce((sum, item) => sum + item.Engagement, 0);
    const totalSpent = filteredData.reduce((sum, item) => sum + item.Spent, 0);
    const totalBudget = filteredData.reduce((sum, item) => sum + item.Budget, 0);

    const cpm = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
    const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
    const cpi = totalInstall > 0 ? totalSpent / totalInstall : 0;
    const cpe = totalEngagement > 0 ? (totalSpent / totalEngagement) * 1000 : 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      totalImpressions, totalClicks, totalInstall, totalFollow, totalEngagement,
      totalSpent, totalBudget, cpm, cpc, cpi, cpe, ctr,
    };
  }, [filteredData]);


  // Export functions (conceptual - real implementation would use a library like SheetJS)
  const exportToExcel = (data, filename) => {
    onMessage('Export to Excel functionality is conceptual. Implement using a library like SheetJS.', 'info');
    console.log(`Exporting ${data.length} records to ${filename}.xlsx`);
  };

  const exportToCSV = (data, filename) => {
    onMessage('Export to CSV functionality is conceptual. Implement manually or using a library.', 'info');
    console.log(`Exporting ${data.length} records to ${filename}.csv`);
  };


  return (
    <main className="p-4 max-w-7xl mx-auto w-full mt-4 flex-grow">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline ml-2">{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading Ads Data..." />
      ) : (
        <>
          {/* Summary Section Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
            <div className="summary-card">
              <div>
                <p className="title">Total Impressions</p>
                <p className="value">{summaryMetrics.totalImpressions.toLocaleString()}</p>
              </div>
            </div>
            <div className="summary-card">
              <div>
                <p className="title">Total Clicks</p>
                <p className="value">{summaryMetrics.totalClicks.toLocaleString()}</p>
              </div>
            </div>
            <div className="summary-card">
              <div>
                <p className="title">Total Engagements</p>
                <p className="value">{summaryMetrics.totalEngagement.toLocaleString()}</p>
              </div>
            </div>
            <div className="summary-card">
              <div>
                <p className="title">Total Spent</p>
                <p className="value">{formatCurrency(summaryMetrics.totalSpent)}</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Input
                type="text"
                placeholder="Campaign Name"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Ads Name"
                value={adsNameSearch}
                onChange={(e) => setAdsNameSearch(e.target.value)}
              />
              <Select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
                {uniquePlatforms.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
              <Select value={objectiveFilter} onChange={(e) => setObjectiveFilter(e.target.value)}>
                {uniqueObjectives.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </Select>
              {/* Added: Device Filter */}
              <Select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)}>
                {uniqueDevices.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
              {/* Added: Segment Filter */}
              <Select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)}>
                {uniqueSegments.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="All">All Time</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last Month">Last Month</option>
                <option value="Custom">Custom Date</option>
              </Select>
              <Input
                type="date"
                placeholder="Start Date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={dateRange !== 'Custom' ? 'hidden' : ''}
              />
              <Input
                type="date"
                placeholder="End Date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={dateRange !== 'Custom' ? 'hidden' : ''}
              />
            </div>
          </Card>

          {/* Detailed Report Table */}
          <Card className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Detailed Report</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportToExcel(sortedData, 'detailed_ads_report')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Export Excel
                </Button>
                <Button
                  onClick={() => exportToCSV(sortedData, 'detailed_ads_report')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Export CSV
                </Button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('Date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date {getSortIndicator('Date')}</th>
                  <th onClick={() => handleSort('Campaign')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign {getSortIndicator('Campaign')}</th>
                  <th onClick={() => handleSort('AdsName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ads Name {getSortIndicator('AdsName')}</th>
                  <th onClick={() => handleSort('Platform')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform {getSortIndicator('Platform')}</th>
                  <th onClick={() => handleSort('Objective')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objective {getSortIndicator('Objective')}</th>
                  <th onClick={() => handleSort('Impressions')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions {getSortIndicator('Impressions')}</th>
                  <th onClick={() => handleSort('Clicks')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks {getSortIndicator('Clicks')}</th>
                  <th onClick={() => handleSort('CTR')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR {getSortIndicator('CTR')}</th>
                  <th onClick={() => handleSort('Install')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install {getSortIndicator('Install')}</th>
                  <th onClick={() => handleSort('Follow')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow {getSortIndicator('Follow')}</th>
                  <th onClick={() => handleSort('Engagement')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement {getSortIndicator('Engagement')}</th>
                  <th onClick={() => handleSort('Spent')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent {getSortIndicator('Spent')}</th>
                  <th onClick={() => handleSort('Budget')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget {getSortIndicator('Budget')}</th>
                  <th onClick={() => handleSort('CostMetric')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Metric {getSortIndicator('CostMetric')}</th>
                  <th onClick={() => handleSort('Devices')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devices {getSortIndicator('Devices')}</th>
                  <th onClick={() => handleSort('Segment')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment {getSortIndicator('Segment')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Date ? item.Date.toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={item.Campaign}>{truncateText(item.Campaign, 20)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={item.AdsName}>{truncateText(item.AdsName, 20)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Platform}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Objective}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Impressions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.CTR.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Install.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Follow.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Engagement.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.Spent)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.Budget)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getCostMetricLabel(item.Objective, item.CostMetric)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Devices}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.Segment}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="16" className="px-6 py-4 text-center text-sm text-gray-500">No data available for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:opacity-50"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {currentPage + 1} of {pageCount || 1}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(pageCount - 1, prev + 1))}
                disabled={currentPage >= pageCount - 1}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </Card>
        </>
      )}
    </main>
  );
};

export default DashboardPage;
