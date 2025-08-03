import { useState } from "react"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PulsesyncForm from "../../../Pages/Survey/PulsesyncForm"
import { Pulsesync } from "../../../Pages/Survey/Pulsesync"
import ResponsePage from "../../../Pages/Survey/responsePage"

function SurveyDashboard({user,workspace}) {
  const [openform, setopenform] = useState(false)
  
  return (
    <>
    {/* {true && <PulsesyncForm prop={setopenform} />} */}
    {
            openform ? 
            <PulsesyncForm prop={setopenform} user={user} workspace={workspace}/> : 
            <Pulsesync prop={setopenform} user={user} workspace={workspace}/>
          } 
  </>
  )
}

           
        
        
        // {/* Survey response route */}
        
        //   path="/response/:surveyId" 
        //   element={<ResponsePage />} 
        
        
        // {/* Fallback route - redirect to dashboard */}
       
          
        //     <PulsesyncForm prop={setopenform}/> : 
        //     <Pulsesync prop={setopenform}/>
          
       
  

export default SurveyDashboard

// import PdfJs from "./components/PdfJs";

// function App() {
//   return (
//     <div>
//       <h1>PDF Viewer</h1>
//       <PdfJs src="/sample.pdf" />
//     </div>
//   );
// }

// export default App;
