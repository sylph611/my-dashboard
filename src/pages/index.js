import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter } from 'recharts';
import './dashboard.css'; // 스타일 파일 import

const Dashboard = () => {
  const [stockDataList, setStockDataList] = useState([]);
  const [time, setTime] = useState();
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [expandedIndicesInfo, setExpandedIndicesInfo] = useState([]);
  const [expandedIndicesNews, setExpandedIndicesNews] = useState([]);
  const [priceList, setPriceList] = useState([]);

  useEffect(() => {
    fetchStockData();
    const intervalId = setInterval(fetchStockData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
  }, [priceList]);

  const fetchStockData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/stock/dashboard');
      const { stockInfoList, time } = response.data;

      setStockDataList(stockInfoList);
      setTime(formatTime(time)); // Format time
      updatePriceList(stockInfoList, formatTime(time)); // Update price list with new data
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const updatePriceList = (newStockDataList, time) => {
    setPriceList((prevPriceList) => {
      const newPriceList = { ...prevPriceList };
      newStockDataList.forEach((stockData) => {
        const { name, price } = stockData;
        if (!newPriceList[name]) {
          newPriceList[name] = [];
        }
        newPriceList[name].push({ time: time, price });
      });
      return newPriceList;
    });
  };

  const toggle = (index) => {
    toggleAccordionInfo(index);
    toggleAccordion(index);
    toggleAccordionNews(index);
  };

  const toggleAccordionInfo = (index) => {
    if (expandedIndicesInfo.includes(index)) {
      setExpandedIndicesInfo(expandedIndicesInfo.filter((i) => i !== index));
    } else {
      setExpandedIndicesInfo([...expandedIndicesInfo, index]);
    }
  };

  const toggleAccordion = (index) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter((i) => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
  };

  const toggleAccordionNews = (index) => {
    if (expandedIndicesNews.includes(index)) {
      setExpandedIndicesNews(expandedIndicesNews.filter((i) => i !== index));
    } else {
      setExpandedIndicesNews([...expandedIndicesNews, index]);
    }
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // 최근 시간의 주식 가격을 중간에 위치하도록 y축 범위 계산
  const calculateYAxisDomain = (stockName) => {
    let minY = Infinity;
    let maxY = -Infinity;
    const priceDataList = priceList[stockName] || [];
    for (const data of priceDataList) {
      const price = parseFloat(data.price);
      if (!isNaN(price)) {
        minY = Math.min(minY, price);
        maxY = Math.max(maxY, price);
      }
    }
    // 최근 시간의 주식 가격을 중간에 위치하도록 계산
    const midY = (minY + maxY) / 2;
    const range = maxY - minY;
    const buffer = range * 0.2; // y축 범위에 여유를 둠
    return [midY - buffer, midY + buffer];
  };
  
  // X축의 범위 계산 함수
const calculateXAxisDomain = (stockName) => {
  let minX, maxX;
  const priceDataList = priceList[stockName] || [];
  // 모든 주식 종목의 시간 데이터를 모아서 최소값과 최대값을 계산
  if (priceDataList.length > 0) {
    const firstTime = priceDataList[0].time;
    const lastTime = priceDataList[priceDataList.length - 1].time;

    // 최소값 계산
    if (!minX || firstTime < minX) {
      minX = firstTime;
    }

    // 최대값 계산
    if (!maxX || lastTime > maxX) {
      maxX = lastTime;
    }
  }
  // 최소값과 최대값을 반환
  return [minX, maxX];
};


  return (
    <div className="dashboard-container">
    <h1 className="dashboard-title">실시간 주식 정보</h1>
    <p className="update-time">최근 업데이트: {time}</p>
    <ul className="stock-list">
      {stockDataList.map((stockData, index) => (
        <li key={index} className="stock-item">
          <button className="accordion" onClick={() => toggle(index)}>
            <p className="stock-company">{stockData.name}</p>
            <p className="stock-price">현재 가격: {stockData.price}</p>
          </button>
          <button className="accordion" onClick={() => toggleAccordionInfo(index)}>
            거래원정보 보기
          </button>
          <div className={`panel ${expandedIndicesInfo.includes(index) ? 'expanded' : ''}`}>
            <div className="investor-trend" dangerouslySetInnerHTML={{ __html: stockData.investorTrendInfo }} />
          </div>
          <button className="accordion" onClick={() => toggleAccordion(index)}>
            차트보기
          </button>
          <div className={`panel ${expandedIndices.includes(index) ? 'expanded' : ''}`}>
            <LineChart width={400} height={200} key={time} data={priceList[stockData.name] || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" domain={calculateXAxisDomain(stockData.name)} />
              <YAxis domain={calculateYAxisDomain(stockData.name)} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" />
              <Scatter dataKey="price" fill="#8884d8" />
            </LineChart>
          </div>
          <button className="accordion" onClick={() => toggleAccordionNews(index)}>
            뉴스보기
          </button>
          <div className={`panel ${expandedIndicesNews.includes(index) ? 'expanded' : ''}`}>
            {stockData.news.map((news, newsIndex) => (
              <div className="investor-trend"><p>{news}</p></div>
            ))}
          </div>
          
        </li>
      ))}
    </ul>
    </div>

          
          
  );
};

export default Dashboard;