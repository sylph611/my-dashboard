import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Scatter } from 'recharts';
import './dashboard.css'; // 스타일 파일 import

const Dashboard = () => {
  const [stockDataList, setStockDataList] = useState([]);
  const [time, setTime] = useState();
  const [expandedIndices, setExpandedIndices] = useState([]);
  const [priceList, setPriceList] = useState([]);

  useEffect(() => {
    fetchStockData();
    const intervalId = setInterval(fetchStockData, 20000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // priceList가 변경될 때마다 갱신된 데이터를 로그로 출력
    console.log('Updated priceList:', priceList);
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

  const toggleAccordion = (index) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter((i) => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
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
  console.log('name', stockName);
  console.log('priceList', priceList[stockName]);
  const priceDataList = priceList[stockName] || [];
  // 모든 주식 종목의 시간 데이터를 모아서 최소값과 최대값을 계산
    
  console.log('aaa', priceDataList.length);
  if (priceDataList.length > 0) {
    const firstTime = priceDataList[0].time;
    const lastTime = priceDataList[priceDataList.length - 1].time;

    console.log('aaa', firstTime);
    console.log('aaa', lastTime);
    // 최소값 계산
    if (!minX || firstTime < minX) {
      minX = firstTime;
    }

    // 최대값 계산
    if (!maxX || lastTime > maxX) {
      maxX = lastTime;
    }
  }


  console.log('minx,maxX : ' , minX, maxX)

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
          <button className="accordion" onClick={() => toggleAccordion(index)}>
            <p className="stock-company">{stockData.name}</p>
            <p className="stock-price">현재 가격: {stockData.price}</p>
            <div className="investor-trend" dangerouslySetInnerHTML={{ __html: stockData.investorTrendInfo }} />
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
        </li>
      ))}
    </ul>
        {/* 화면 하단에 priceList를 JSON 형태로 출력 */}
        <div className="price-list">
          <h2>Price List</h2>
          <pre>{JSON.stringify(priceList, null, 2)}</pre>
        </div>
    </div>

          
          
  );
};

export default Dashboard;