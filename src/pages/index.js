// pages/index.js

import { useState, useEffect } from 'react';
import axios from 'axios';
import './dashboard.css'; // 스타일 파일 import

const Dashboard = () => {
  const [stockDataList, setStockDataList] = useState([]);
  const [time, setTime] = useState();
  const [expandedIndices, setExpandedIndices] = useState([]);

  const fetchStockData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/stock/dashboard');
      setStockDataList(response.data.stockInfoList);
      setTime(formatTime(response.data.time)); // 시간 형식화 함수 사용
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  useEffect(() => {
    fetchStockData();

    const intervalId = setInterval(() => {
      fetchStockData();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  const toggleAccordion = (index) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter((i) => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
  };

  // 시간을 형식화하는 함수
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">실시간 주식 정보</h1>
      <p className="update-time">최근 업데이트: {time}</p>
      <ul className="stock-list">
        {stockDataList.map((stockData, index) => (
          <li key={index} className="stock-item">
            <button className="accordion" onClick={() => toggleAccordion(index)}>
              <p className="stock-company">{stockData.name}</p>
              <p className="stock-price">현재 가격: {stockData.price}</p>
            </button>
            <div className={`panel ${expandedIndices.includes(index) ? 'expanded' : ''}`}>
              <div className="investor-trend" dangerouslySetInnerHTML={{ __html: stockData.investorTrendInfo }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};


export default Dashboard;