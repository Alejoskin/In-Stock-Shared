import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
    <div class="header">
        <button class="settings-button">Settings</button> 
        <a href="design.html" class="logo">In Stock</a>

        <div class="login"> 
            <button class="login-button">Login</button>
            <button class="register-button">Register</button>
        </div>
    </div>

    <div class="left-menu">
        <div class="dropdown">
        <button class="dropdown-button">Dropdown</button>
        <div class="dropdown-content">
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
        </div>
        </div>
        <div class="dropdown">
            <button class="dropdown-button">Dropdown</button>
            <div class="dropdown-content">
                <a href="#">Link 1</a>
                <a href="#">Link 2</a>
                <a href="#">Link 3</a>
            </div>
            
        </div>
      </div>





    </>
  )
}

export default App
