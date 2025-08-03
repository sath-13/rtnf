import React from 'react';
import './styles.css'

import {DetailsContent,DetailsBanner} from '../../components';


const ProjectDetails=()=>{
return(
    <div className="scroll-container">
        <DetailsBanner></DetailsBanner>   
        <DetailsContent></DetailsContent>

 </div>
   
)
}

export default ProjectDetails;