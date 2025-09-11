import React, { useState, useEffect } from 'react';

// GCD and Modulo Inverse helper functions
const gcd = (a, b) => {
 while (b !== 0) {
   [a, b] = [b, a % b];
 }
 return a;
};

const extendedGcd = (a, b) => {
 if (a === 0) {
   return [b, 0, 1];
 }
 const [g, y, x] = extendedGcd(b % a, a);
 return [g, x - Math.floor(b / a) * y, y];
};

const modInverse = (a, m) => {
 const [g, x] = extendedGcd(a, m);
 if (g !== 1) {
   return null; // modular inverse does not exist
 }
 return (x % m + m) % m;
};

// Component to calculate and display the next matching timestamp
const TimestampCalculator = ({ solution, modulus }) => {
 const [nextTimestamp, setNextTimestamp] = useState(null);
 const [nextPaliaTime, setNextPaliaTime] = useState(null);

 useEffect(() => {
   if (solution !== null && modulus !== null) {
     const nowInSeconds = Math.floor(Date.now() / 1000);
     const remainder = nowInSeconds % modulus;
     let timeToAdd = (solution - remainder + modulus) % modulus;
     const nextMatchingTime = nowInSeconds + timeToAdd;

     setNextTimestamp(nextMatchingTime);

     // Convert UNIX timestamp to Palia time
     const date = new Date(nextMatchingTime * 1000);
     const realTimeElapsedMs = (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) * 1000;
     const paliaTimeElapsedMs = realTimeElapsedMs * 24;

     const paliaHours = Math.floor(paliaTimeElapsedMs / 3600000) % 24;
     const paliaMinutes = Math.floor((paliaTimeElapsedMs % 3600000) / 60000);

     const formattedHours = (paliaHours % 12 === 0 ? 12 : paliaHours % 12).toString().padStart(2, '0');
     const formattedMinutes = paliaMinutes.toString().padStart(2, '0');
     const ampm = paliaHours < 12 ? 'AM' : 'PM';

     setNextPaliaTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
   } else {
     setNextTimestamp(null);
     setNextPaliaTime(null);
   }
 }, [solution, modulus]);

 if (nextTimestamp === null) {
   return null;
 }

 return (
   <div className="mt-8">
     <h2 className="text-xl font-semibold mb-4 text-blue-500">Next Run</h2>
     <div className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-2">
       <div>
         <h3 className="text-lg font-bold">UNIX Timestamp:</h3>
         <p className="font-mono text-gray-800">{nextTimestamp}</p>
       </div>
       <div>
         <h3 className="text-lg font-bold">Palia Time:</h3>
         <p className="font-mono text-gray-800">{nextPaliaTime}</p>
       </div>
     </div>
   </div>
 );
};

const PlatformStates = ({congruences, currentTimestamp, solutionInfo}) => {
  const [nextTimestamp, setNextTimestamp] = useState(null);

  useEffect(() => {
    const solution = solutionInfo.value;
    const modulus = solutionInfo.modulus;
    if (solution !== null && modulus !== null) {
     const nowInSeconds = Math.floor(Date.now() / 1000);
     const remainder = nowInSeconds % modulus;
     let timeToAdd = (solution - remainder + modulus) % modulus;
     const nextMatchingTime = nowInSeconds + timeToAdd;  
     setNextTimestamp(nextMatchingTime);
    } else {
      nextTimestamp(null);
    }
  }, [solutionInfo]);

  if (solutionInfo == null) {
    return null;
  }

  return (
    <div className="flex justify-center space-x-4 mt-4">
      {congruences.map((c, index) => {
        const isUp = c.b > 0 && (Math.floor(currentTimestamp / c.b) % 2 === 0);
        const isUpAtStart = Math.floor(nextTimestamp / c.b) % 2 == 0;
        const swap = isUpAtStart && c.downAtStart || !isUpAtStart && !c.downAtStart;
        const effectiveStatus = swap ? !isUp : isUp;
        return (
          <div key={index} className="text-center">
            <span className="text-sm font-semibold text-gray-600">{c.b}s Platform</span>
            <div className={`text-lg font-bold w-16 flex justify-center ${effectiveStatus ? 'text-green-500' : 'text-red-500'}`}>
              {effectiveStatus ? 'UP' : 'DOWN'}
            </div>
          </div>
        );
      })}
    </div>
  )
};

// Component to display Palia time
const PaliaClock = ({ congruences, currentTimestamp }) => {
 const [paliaTime, setPaliaTime] = useState('');

 useEffect(() => {
   const updateTime = () => {
     const now = Math.floor(new Date().getTime() / 1000);
    
     const paliaHours = Math.floor(now % 3600 / 150);
     const paliaMinutes = Math.floor(now / 2.5) % 60;
    
     const formattedHours = (paliaHours % 12 === 0 ? 12 : paliaHours % 12).toString().padStart(2, '0');
     const formattedMinutes = paliaMinutes.toString().padStart(2, '0');
     const ampm = paliaHours < 12 ? 'AM' : 'PM';

     setPaliaTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
   };

   updateTime();
   const interval = setInterval(updateTime, 1000 / 30); // Update 30 times per second
   return () => clearInterval(interval);
 }, []);

 return (
   <div className="text-center mb-6">
     <h2 className="text-2xl font-bold text-gray-700">Current Palia Time</h2>
     <p className="text-4xl font-mono text-blue-600">
       {paliaTime}
     </p>
   </div>
 );
};

// Component to calculate the starting position for each platform being planned
const PlatformStartCalculator = () => {
 const [secondsIntoRun, setSecondsIntoRun] = useState(0);
 const [platformCycle, setPlatformCycle] = useState(0);
 const [result, setResult] = useState(0);

 useEffect(() => {
   if (platformCycle > 0) {
     // Correct mathematical modulo for negative numbers
     const remainder = ((-secondsIntoRun % platformCycle) + platformCycle) % platformCycle;
     setResult(remainder);
   } else {
     setResult(0);
   }
 }, [secondsIntoRun, platformCycle]);

 return (
   <div className="mt-8">
     <h2 className="text-xl font-semibold mb-4 text-blue-500">Starting Position Calculator</h2>
     <div className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-4">
       <div className="flex items-center space-x-2">
         <label htmlFor="cycleInput" className="text-lg">Platform Cycle:</label>
         <input
           id="cycleInput"
           type="number"
           value={platformCycle}
           onChange={(e) => setPlatformCycle(parseInt(e.target.value) || 0)}
           className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
       </div>
       <div className="flex items-center space-x-2">
         <label htmlFor="secondsInput" className="text-lg">Seconds Into Run:</label>
         <input
           id="secondsInput"
           type="number"
           value={secondsIntoRun}
           onChange={(e) => setSecondsIntoRun(parseInt(e.target.value) || 0)}
           className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
       </div>
       <div>
         <h3 className="text-lg font-bold">Position at Start of Run:</h3>
         <p className="font-mono text-gray-800">
           {`${result}`}
         </p>
       </div>
     </div>
   </div>
 );
};

// Tab for setting up runs based on Platform Planner
const RunSetupTab = ({ solutionInfo, congruences, currentTimestamp }) => (
 <div>
   <PaliaClock congruences={congruences} currentTimestamp={currentTimestamp} />
   {solutionInfo && <PlatformStates congruences={congruences} currentTimestamp={currentTimestamp} solutionInfo={solutionInfo} />} 
   {solutionInfo && <TimestampCalculator solution={solutionInfo.value} modulus={solutionInfo.modulus} />}
 </div>
);

// Tab for Congruence Solver
const PlatformPlannerTab = ({ congruences, setCongruences, solutionInfo, error }) => {
 return (
   <div>
     <h2 className="text-xl font-semibold mb-4 text-blue-500">Planned Platforms</h2>
     <p>For each platform you want to plan, input its cycle (the time it takes to travel from one end to the other)
      and the position in its cycle at the moment you start your run. Use "Platform Start Calculator" below to
      calculate initial platform values. Solution will display an offset and interval that indicate when to start
      the run, and how many seconds there are between valid start times.
     </p>
     <div className="space-y-4">
       {congruences.map((c, index) => {
         return (
           <div key={index} className="flex items-center space-x-2">
             <span className="text-lg">Platform cycle: </span>
             <input
               type="number"
               value={c.b}
               onChange={(e) => {
                 const newCongruences = [...congruences];
                 newCongruences[index].b = parseInt(e.target.value) || 0;
                 setCongruences(newCongruences);
               }}
               className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             <span className="text-lg">Position at start time: </span>
             <input
               type="number"
               value={c.a}
               onChange={(e) => {
                 const newCongruences = [...congruences];
                 newCongruences[index].a = parseInt(e.target.value) || 1;
                 setCongruences(newCongruences);
               }}
               className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             <label className="flex items-center space-x-1">
               <input
                 type="checkbox"
                 checked={c.downAtStart}
                 onChange={(e) => {
                   const newCongruences = [...congruences];
                   newCongruences[index].downAtStart = e.target.checked;
                   setCongruences(newCongruences);
                 }}
                 className="form-checkbox"
               />
               <span className="text-sm">Down At Start: </span>
             </label>
             <button
               onClick={() => {
                 const newCongruences = congruences.filter((_, i) => i !== index);
                 setCongruences(newCongruences);
               }}
               className="p-1 text-red-500 hover:text-red-700"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
               </svg>
             </button>
           </div>
         );
       })}
       <button
         onClick={() => setCongruences([...congruences, { a: 0, b: 1, downAtStart: false }])}
         className="w-full py-2 px-4 rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200 shadow-md"
       >
         Add Platform
       </button>
     </div>

     <h2 className="text-xl font-semibold mt-8 mb-4 text-blue-500">Solution</h2>
     <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
       <pre className="text-lg font-mono whitespace-pre-wrap">
         {error || (solutionInfo ? `Start=${solutionInfo.value}s Interval=${solutionInfo.modulus}s` : 'Enter platforms to calculate start time and run interval.')}
       </pre>
     </div>
    
     <PlatformStartCalculator />
   </div>
 );
};

// Main App Component
const App = () => {
 const [activeTab, setActiveTab] = useState('palia');
 const [congruences, setCongruences] = useState([
   { a: 5, b: 8, downAtStart: true },
   { a: 2, b: 7, downAtStart: false },
   { a: 1, b: 6, downAtStart: false },
   { a: 7, b: 10, downAtStart: false },
 ]);

 const [solutionInfo, setSolutionInfo] = useState(null);
 const [error, setError] = useState(null);
 const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));

 useEffect(() => {
   const interval = setInterval(() => {
     setCurrentTimestamp(Math.floor(Date.now() / 1000));
   }, 1000);
   return () => clearInterval(interval);
 }, []);

 // Function to solve the system of congruences
 const solveSystem = () => {
   if (congruences.length === 0) {
     setSolutionInfo(null);
     setError(null);
     return;
   }

   let currentA = congruences[0].a;
   let currentB = congruences[0].b;
  
   // Check initial condition: a must be less than b
   if (currentA >= currentB) {
     currentA = currentA % currentB;
   }

   // Iteratively solve the system, two congruences at a time
   for (let i = 1; i < congruences.length; i++) {
     const { a, b } = congruences[i];
     const g = gcd(currentB, b);
     const newA = a;
     const newB = b;

     // Check for consistency (solvability)
     if ((newA - currentA) % g !== 0) {
       setError('No solution exists for this system.');
       setSolutionInfo(null);
       return;
     }

     // Solve for the new multiplier k
     const bInverse = modInverse(currentB / g, newB / g);
     if (bInverse === null) {
       setError('No solution exists for this system.');
       setSolutionInfo(null);
       return;
     }

     const k = (((newA - currentA) / g) * bInverse) % (newB / g);
    
     const newCurrentA = currentA + k * currentB;
     const newCurrentB = (currentB * newB) / g;

     currentA = newCurrentA;
     currentB = newCurrentB;
   }

   const finalSolution = (currentA % currentB + currentB) % currentB;
   
   setSolutionInfo({ value: finalSolution, modulus: currentB });
   setError(null);
 };

 useEffect(() => {
   solveSystem();
 }, [congruences]);

 return (
   <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4 font-sans text-gray-800">
     <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
       <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
         Tower Run Planner
       </h1>
      
       {/* Tab Navigation */}
       <div className="flex justify-center mb-6 border-b border-gray-200">
         <button
           onClick={() => setActiveTab('palia')}
           className={`py-2 px-6 font-semibold transition-colors duration-200 ${
             activeTab === 'palia' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
           }`}
         >
           Run Setup
         </button>
         <button
           onClick={() => setActiveTab('solver')}
           className={`py-2 px-6 font-semibold transition-colors duration-200 ${
             activeTab === 'solver' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
           }`}
         >
           Platform Planner
         </button>
       </div>

       {/* Tab Content */}
       {activeTab === 'palia' ? (
         <RunSetupTab solutionInfo={solutionInfo} congruences={congruences} currentTimestamp={currentTimestamp} />
       ) : (
         <PlatformPlannerTab
           congruences={congruences}
           setCongruences={setCongruences}
           solutionInfo={solutionInfo}
           error={error}
         />
       )}
     </div>
   </div>
 );
};

export default App;
