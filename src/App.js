import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Cart from './Pages/Cart';
import Checkout from "./Pages/Checkout";
import PaymentResult from "./Pages/PaymentResult";


function App() {
  return (
    <div className="App">
        <Router>
          <Routes>
            <Route element={<Login/>} path='/login' />
            <Route element={<Cart/>} path='/cart' />
            <Route element={<Home/>} path='/' />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>
        </Router>
    </div>
  );
}

export default App;
