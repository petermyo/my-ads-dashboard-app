import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatCurrency, getCostMetricLabel, truncateText } from '../utils/helpers';

const DATA_URL = 'https://opensheet.elk.sh/1n66ctdtHrySM957k4TFRYfO6JRmJ9Y5oBGaIMS3g8PY/result';

const SummaryPage = ({ onMessage }) => {
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states (similar to Dashboard, but fewer needed for grouped summary)
  const [campaignSearch, setCampaignSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [objectiveFilter, setObjectiveFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Sorting states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchAdsData = async () => {
      setLoading(true);
      setError(null);
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
            : null;

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
        }).filter(item => item.Date instanceof Date && !isNaN(item.Date.getTime()));
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

  const uniquePlatforms = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Platform).filter(p => p && p !== 'All'))];
  }, [adsData]);

  const uniqueObjectives = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Objective).filter(o => o && o !== 'All'))];
  }, [adsData]);


  const filteredData = useMemo(() => {
    let currentData = [...adsData];

    if (campaignSearch) {
      currentData = currentData.filter(item =>
        item.Campaign?.toLowerCase().includes(campaignSearch.toLowerCase())
      );
    }
    if (platformFilter !== 'All') {
      currentData = currentData.filter(item => item.Platform === platformFilter);
    }
    if (objectiveFilter !== 'All') {
      currentData = currentData.filter(item => item.Objective === objectiveFilter);
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
  }, [adsData, campaignSearch, platformFilter, objectiveFilter, dateRange, customStartDate, customEndDate]);

  const groupedSummaryData = useMemo(() => {
    const campaignGroups = new Map();

    filteredData.forEach(item => {
      const campaignName = item.Campaign;
      if (!campaignName) return; // Skip if campaign name is missing

      if (!campaignGroups.has(campaignName)) {
        campaignGroups.set(campaignName, {
          Campaign: campaignName,
          TotalImpressions: 0,
          TotalClicks: 0,
          TotalInstall: 0,
          TotalFollow: 0,
          TotalEngagement: 0,
          TotalSpent: 0,
          TotalBudget: 0,
        });
      }

      const group = campaignGroups.get(campaignName);
      group.TotalImpressions += item.Impressions;
      group.TotalClicks += item.Clicks;
      group.TotalInstall += item.Install;
      group.TotalFollow += item.Follow;
      group.TotalEngagement += item.Engagement;
      group.TotalSpent += item.Spent;
      group.TotalBudget += item.Budget;
    });

    const groupedArray = Array.from(campaignGroups.values()).map(group => {
      const cpm = group.TotalImpressions > 0 ? (group.TotalSpent / group.TotalImpressions) * 1000 : 0;
      const cpc = group.TotalClicks > 0 ? group.TotalSpent / group.TotalClicks : 0;
      const cpi = group.TotalInstall > 0 ? group.TotalSpent / group.TotalInstall : 0;
      const cpe = group.TotalEngagement > 0 ? (group.TotalSpent / group.TotalEngagement) * 1000 : 0;
      const ctr = group.TotalImpressions > 0 ? (group.TotalClicks / group.TotalImpressions) * 100 : 0;

      return {
        ...group,
        CTR: ctr,
        CPM: cpm,
        CPC: cpc,
        CPI: cpi,
        CPE: cpe,
      };
    });

    if (!sortConfig.key) return groupedArray;

    return [...groupedArray].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (['TotalImpressions', 'TotalClicks', 'TotalInstall', 'TotalFollow', 'TotalEngagement', 'TotalSpent', 'TotalBudget', 'CTR', 'CPM', 'CPC', 'CPI', 'CPE'].includes(sortConfig.key)) {
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

  }, [filteredData, sortConfig]);


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
        <LoadingSpinner message="Loading Summary Data..." />
      ) : (
        <>
          {/* Filters Section */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Input
                type="text"
                placeholder="Campaign Name"
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
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

          {/* Grouped Summary Table */}
          <Card className="overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Campaign Summary Report</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => exportToExcel(groupedSummaryData, 'campaign_summary_report')}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Export Excel
                </Button>
                <Button
                  onClick={() => exportToCSV(groupedSummaryData, 'campaign_summary_report')}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Export CSV
                </Button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('Campaign')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign {getSortIndicator('Campaign')}</th>
                  <th onClick={() => handleSort('TotalImpressions')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions {getSortIndicator('TotalImpressions')}</th>
                  <th onClick={() => handleSort('TotalClicks')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks {getSortIndicator('TotalClicks')}</th>
                  <th onClick={() => handleSort('CTR')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR {getSortIndicator('CTR')}</th>
                  <th onClick={() => handleSort('TotalInstall')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Install {getSortIndicator('TotalInstall')}</th>
                  <th onClick={() => handleSort('TotalFollow')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow {getSortIndicator('TotalFollow')}</th>
                  <th onClick={() => handleSort('TotalEngagement')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement {getSortIndicator('TotalEngagement')}</th>
                  <th onClick={() => handleSort('TotalSpent')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent {getSortIndicator('TotalSpent')}</th>
                  <th onClick={() => handleSort('TotalBudget')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget {getSortIndicator('TotalBudget')}</th>
                  <th onClick={() => handleSort('CPM')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPM {getSortIndicator('CPM')}</th>
                  <th onClick={() => handleSort('CPC')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPC {getSortIndicator('CPC')}</th>
                  <th onClick={() => handleSort('CPI')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPI {getSortIndicator('CPI')}</th>
                  <th onClick={() => handleSort('CPE')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPE {getSortIndicator('CPE')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupedSummaryData.length > 0 ? (
                  groupedSummaryData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" title={item.Campaign}>{truncateText(item.Campaign, 25)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalImpressions.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalClicks.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.CTR.toFixed(2)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalInstall.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalFollow.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.TotalEngagement.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.TotalSpent)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.TotalBudget)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.CPM)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.CPC)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.CPI)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(item.CPE)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="13" className="px-6 py-4 text-center text-sm text-gray-500">No summary data available for the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </main>
  );
};
