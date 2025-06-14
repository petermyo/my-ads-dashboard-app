import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Select from '../components/Common/Select';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { formatCurrency, truncateText } from '../utils/helpers';

// Use process.env to access the environment variable set in Cloudflare Pages.
// For Create React App, client-side environment variables must be prefixed with REACT_APP_.
const DATA_URL = process.env.DATA_URL;

const DashboardPage = ({ onMessage }) => {
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [campaignSearch, setCampaignSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [objectiveFilter, setObjectiveFilter] = useState('All');
  const [deviceFilter, setDeviceFilter] = useState('All');
  const [segmentFilter, setSegmentFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Sorting states
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

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
  }, [onMessage]); // Depend on onMessage if it's external, otherwise it's safe to omit if stable

  // Memoized unique filter options
  const uniquePlatforms = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Platform).filter(p => p && p !== 'All'))];
  }, [adsData]);

  const uniqueObjectives = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Objective).filter(o => o && o !== 'All'))];
  }, [adsData]);

  const uniqueDevices = useMemo(() => {
    return ['All', ...new Set(adsData.map(item => item.Devices).filter(d => d && d !== 'All'))];
  }, [adsData]);

  const uniqueSegments = useMemo(() => {
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
  }, [adsData, campaignSearch, platformFilter, objectiveFilter, deviceFilter, segmentFilter, dateRange, customStartDate, customEndDate]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle numeric sorting for relevant fields
      if (['Impressions', 'Clicks', 'Install', 'Follow', 'Engagement', 'Spent', 'Budget', 'CTR', 'CostMetric'].includes(sortConfig.key)) {
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="summary-card">
              <p className="title">Total Impressions</p>
              <p className="value">{sortedData.reduce((sum, item) => sum + item.Impressions, 0).toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <p className="title">Total Clicks</p>
              <p className="value">{sortedData.reduce((sum, item) => sum + item.Clicks, 0).toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <p className="title">Total Spent</p>
              <p className="value">{formatCurrency(sortedData.reduce((sum, item) => sum + item.Spent, 0))}</p>
            </div>
            <div className="summary-card">
              <p className="title">Overall CTR</p>
              <p className="value">
                {sortedData.reduce((sum, item) => sum + item.Impressions, 0) > 0
                  ? (sortedData.reduce((sum, item) => sum + item.Clicks, 0) / sortedData.reduce((sum, item) => sum + item.Impressions, 0) * 100).toFixed(2)
                  : 0
                }%
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <Card className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Input
                type="text"
                placeholder="Search Campaign/Ads Name"
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
              <Select value={deviceFilter} onChange={(e) => setDeviceFilter(e.target.value)}>
                {uniqueDevices.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Select>
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

          {/* Data Table */}
          <Card className="overflow-x-auto">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Ads Data</h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th onClick={() => handleSort('Date')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date {getSortIndicator('Date')}</th>
                  <th onClick={() => handleSort('Campaign')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign {getSortIndicator('Campaign')}</th>
                  <th onClick={() => handleSort('AdsName')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ads Name {getSortIndicator('AdsName')}</th>
                  <th onClick={() => handleSort('Platform')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform {getSortIndicator('Platform')}</th>
                  <th onClick={() => handleSort('Objective')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objective {getSortIndicato