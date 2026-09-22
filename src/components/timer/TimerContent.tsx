// import React, { useState } from 'react'
// import { icon } from '../../utility/icon'
// import Timer from './Timer'
// import RulesModal from '../../modals/RulesModal'

// interface contentProp {
//     timers: Record<string, string | null>
//     lobbyTab: number
//     id: number;
//     lobby: Record<string, any>;
// }
// const TimerContent: React.FC<contentProp> = ({ timers, lobbyTab,lobby, id }) => {
//     const [rulesModal,setRulesModal] = useState<boolean>(false)
//     return (
//       <>
//         <div className="lobby-tab-data">
//             <div className="lobby-tab-data-body">
//                 <div className="lobby-id-container">
//                     <div className="lobby-id-upper">
//                         <div className="lobby-id-upper-left">
//                             <div className="wingo-text-content">
//                                 <div className="clock-box">
//                                     <img src={icon?.clock} alt="" />
//                                 </div>
//                                 <div className="wingo-text">
//                                     Wingo {lobbyTab === 0? "1 Min": `${["3 Min", "5 Min"][lobbyTab - 1]}`}
//                                 </div>
//                             </div>
//                             <div className="last-draw">
//                                 <span>Last Draw</span>
//                                 {lobby[`parsedData${id}`]}
//                             </div>
//                         </div>
//                         <div className="last-right-result">
//                             <span className='last-his-text'>Last draw result</span>
//                             <div className="result-box">
//                                 <div className="" style={{ height: "46.0909px", overflow: "hidden" }}>
//                                     <div className="ball-box-container">
//                                         <div className="animated-item">
//                                             <div className="animated-item-ball">8</div>
//                                         </div>

//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="next-draw-container">
//                         <div className="timer-component">
//                             <div>
//                                 <div className="next-draw" >Next draw</div>
//                                 <div className="next-draw" style={{ fontWeight: "700" }}>202505290959</div>
//                             </div>
//                             {lobbyTab === 0 && <Timer time={timers?.firstTime} />}
//                             {lobbyTab === 1 && <Timer time={timers?.secondTime} />}
//                             {lobbyTab === 2 && <Timer time={timers?.thirdTime} />}
//                             {lobbyTab === 3 && <Timer time={timers?.fourthTime} />}

//                         </div>
//                         <div className="rules-container">
//                             <div className="rules-box" onClick={()=>setRulesModal(true)}>
//                                 <svg className="size-5 text-white" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10 18.75C14.8325 18.75 18.75 14.8325 18.75 10C18.75 5.16751 14.8325 1.25 10 1.25C5.16751 1.25 1.25 5.16751 1.25 10C1.25 14.8325 5.16751 18.75 10 18.75ZM9.97997 9.24892C9.32709 9.75353 8.59362 10.3204 8.73011 11.3409H10.2074C10.1158 10.5513 10.7013 10.1075 11.3052 9.64958C11.9007 9.19803 12.5142 8.73285 12.5142 7.90909C12.5142 6.39773 11.3097 5.625 9.66193 5.625C8.44602 5.625 7.44602 6.18182 6.71875 7.02273L7.65057 7.875C8.20739 7.29545 8.77557 6.97727 9.46875 6.97727C10.3665 6.97727 10.9119 7.36364 10.9119 8.05682C10.9119 8.52861 10.4685 8.87133 9.97997 9.24892ZM8.46875 13.3636C8.46875 13.9545 8.8892 14.375 9.48011 14.375C10.0483 14.375 10.4801 13.9545 10.4801 13.3636C10.4801 12.7727 10.0483 12.3636 9.48011 12.3636C8.90057 12.3636 8.46875 12.7727 8.46875 13.3636Z" fill="currentColor"></path></svg>
//                                 Rules
//                             </div>
//                             <div className="border-left"></div>
//                             <div className="scroll-box">
//                                 <div className="" >
//                                     <svg viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "1.25rem", height: "1.3125rem" }}><path d="M1.66602 18.834H18.3327" stroke="var(--basic-color-white)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M1.66602 11.334L4.99935 12.1673V16.334H1.66602V11.334Z" fill="var(--basic-color-white)"></path><path d="M8.33398 10.5007L11.6673 8.83398V16.334H8.33398V10.5007Z" fill="var(--basic-color-white)"></path><path d="M15 7.16667L18.3333 5.5V16.3333H15V7.16667Z" fill="var(--basic-color-white)"></path><path d="M1.66602 7.99935L4.99935 8.83268L18.3327 2.16602H14.166" stroke="var(--basic-color-white)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>

//                                 </div>
//                                 <div className="" style={{ cursor: "pointer" }}>
//                                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" fill="none" style={{ width: "0.875rem", height: "0.875rem" }}><path d="M2.77778 5L5.88889 8.11111L9 5" stroke="var(--basic-color-white)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div className="round-cricle"></div>
//             <div className="round-cricle-right"></div>
//         </div>
//         {
//             rulesModal && <RulesModal setRulesModal={setRulesModal}/>
//         }
//       </>
//     )
// }

// export default TimerContent