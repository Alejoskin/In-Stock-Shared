import { useState } from 'react'
import './App.css'

function App() {

  return (
    <>
      
    <div className="header">
        <button className="settings-button">Settings</button> 
        <a href="App.jsx" className="logo">In Stock</a>

        <div className="login"> 
            <button className="login-button">Login</button>
            <button className="register-button">Register</button>
        </div>
    </div>

    <div className="left-menu">
        <div className="dropdown">
        <button className="dropdown-button">Dropdown</button>
        <div className="dropdown-content">
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
        </div>
        </div>
        <div className="dropdown">
            <button className="dropdown-button">Dropdown</button>
            <div className="dropdown-content">
                <a href="#">Link 1</a>
                <a href="#">Link 2</a>
                <a href="#">Link 3</a>
            </div>
            
        </div>
        <div className="table-area">

        </div>
      </div>





    </>
  )
}

export default App
