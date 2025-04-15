// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './Redux/index.js'
import './components/common/axiosConfig'
import PrivateRoute from './components/PrivateRoute';

createRoot(document.getElementById('root')).render(
   // <PrivateRoute>
    <Provider store={store}>
    <App />
    </Provider>
    //</PrivateRoute>
)
