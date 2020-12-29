import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import MainPage from './MainPage';
import Conductors from './pages/conductors/Conductors';
import MsPaintMatrix from './pages/mspaintmatrix/MsPaintMatrix';
import PhotoMosaic from './pages/photomosaic/PhotoMosaic';
import Mandelbrot from './pages/mandelbrot/Mandelbrot';
import Quadtrees from './pages/quadtrees/Quadtrees';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={MainPage} />
        <Route exact path="/conductors" component={Conductors} />
        <Route exact path="/mspaintmatrix" component={MsPaintMatrix} />
        <Route exact path="/photomosaic" component={PhotoMosaic} />
        <Route exact path="/mandelbrot" component={Mandelbrot} />
        <Route exact path="/quadtrees" component={Quadtrees} />
      </Switch>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
