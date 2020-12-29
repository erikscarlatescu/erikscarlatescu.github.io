import React from "react";
import {Link} from "react-router-dom";

interface Props {
    link: string;
    img: string;
    alttext: string;
    caption: string;
}

export const ArticleCard: React.FC<Props> = ({link, img, alttext, caption}) => {
    return (
        <Link to={link}>
            <article className="cardArticle">
                <img className="cardThumbnail" src={img} alt={alttext} />
                <h4 className="cardCaption">{caption}</h4>
            </article>
        </Link>
    )
}

export default ArticleCard;