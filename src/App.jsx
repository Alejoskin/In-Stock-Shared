import { useEffect, useState } from 'react';
import './App.css';
import data from './data.json'; // If it's in src/
import { useNavigate } from 'react-router-dom';


function App() {
  const [currentData, setCurrentData] = useState([]);
  const [fullData, setFullData] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(true);
  
  useEffect(() => {
    // Load JSON data on mount
    setFullData(data);
    setCurrentData(data.category1);
  }, []);

  const toggleSidebar = () =>{
    setSidebarVisible(!sidebarVisible);
  }

  return (
    <>
      <div className="header">
        <button className="settings-button" onClick={toggleSidebar}>Settings</button>
        <a href="#" className="logo">In Stock</a>
        <div className="login">
          <button className="login-button">Login</button>
          <button className="register-button">Register</button>
        </div>
      </div>
      <div className={`left-menu ${sidebarVisible ? '' : 'hidden'}`}>

      <div className="dropdown"> 
        <div className='dropdown'>
          
        </div>
          <button className="category" onClick={() => setCurrentData(fullData.allItems)}>All Items</button>
        </div>
        <div className="dropdown">
          <button className="category" onClick={() => setCurrentData(fullData.category1)}>Category 1</button>
        </div>
        <div className="dropdown">
          <button className="category" onClick={() => setCurrentData(fullData.category2)}>Category 2</button>
        </div>
        <div className="dropdown">
          <button className="new-category">New Category</button>
        </div>
      </div>
    


      <div className={`table-area ${sidebarVisible ? '' : 'full-width'}`}> 
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.type}</td>
                <td>{item.amount}</td>
                <td><button>+</button> <button>-</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
