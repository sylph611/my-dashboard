// pages/index.js

import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stockDataList, setStockDataList] = useState([]);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/stock/dashboard'); // 백엔드 API 경로
        setStockDataList(response.data.stockInfoList);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, []);

  return (
    <div>
      <h1>주식 정보</h1>
      <ul>
        {stockDataList.map((stockData, index) => (
          <li key={index}>
            <p>회사: {stockData.name}</p>
            <p>가격: {stockData.price}</p>
            <div dangerouslySetInnerHTML={{ __html: stockData.investorTrendInfo }} />
            {}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;