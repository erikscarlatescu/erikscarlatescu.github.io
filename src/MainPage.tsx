import React, { useEffect } from 'react';

import ArticleCard from './util/ArticleCard';

import quadtreethumbnail from './pages/quadtrees/thumbnail.png'
import mandelbrotthumbnail from './pages/mandelbrot/thumbnail.png'
import conductorsthumbnail from './pages/conductors/thumbnail.png'
import photomosaicthumbnail from './pages/photomosaic/thumbnail.jpg'
import mspaintmatrixthumbnail from './pages/mspaintmatrix/thumbnail.png'
import tictactoethumbnail from './pages/tictactoe/thumbnail.png'

export const MainPage = () => {
    useEffect(() => {
        document.title = "Erik's Website";
    });

    return (
        <div className="mainContent">
			<h1>My Personal Projects</h1>
			<p>My name is Erik Scarlatescu and this is a site where I post about different things I work on in my free time.
                I'm intensely curious and always finding something new to experiment with.
			</p>
            <div className="cardRow">
                <ArticleCard link="/tictactoe" img={tictactoethumbnail} caption="Making a foolproof AI for tictactoe" alttext="Thumbnail showing sample board of tictactoe game."/>
                <ArticleCard link="/quadtrees" img={quadtreethumbnail} caption="Voxel octrees (and pixel quadtrees)" alttext="Thumbnail showing screenshot of interactive quadtree on the page."/>
                <ArticleCard link="/mandelbrot" img={mandelbrotthumbnail} caption="Visualizing mandelbrot set in browser" alttext="Thumbnail showing screenshot of interactive quadtree on the page."/>
                <ArticleCard link="/conductors" img={conductorsthumbnail} caption="Visualizing point charges in electrostatic conductors" alttext="Thumbnail showing screenshot of interactive quadtree on the page."/>
                <ArticleCard link="/photomosaic" img={photomosaicthumbnail} caption="Photo mosaic generator for history project" alttext="Thumbnail showing screenshot of interactive quadtree on the page."/>
                <ArticleCard link="/mspaintmatrix" img={mspaintmatrixthumbnail} caption="How to actually rotate text in Microsoft Paint" alttext="Thumbnail showing screenshot of interactive quadtree on the page."/>
            </div>
        </div>
    );
}

export default MainPage;