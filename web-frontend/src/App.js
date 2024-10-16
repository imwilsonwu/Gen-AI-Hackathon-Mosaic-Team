import logo from "./logo.svg";
import "./App.css";

import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "./chatbot/config.js";
import MessageParser from "./chatbot/MessageParser.js";
import ActionProvider from "./chatbot/ActionProvider.js";
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Col, Row } from "antd";
import { Card, Button, Input } from "antd";
import { Flex } from "antd";
import { useEffect, useState } from "react";

import Map from "./maprender/map.js";

// const { spawn } = require('child_process');

function App() {
  const [currentPage, setCurrentPage] = useState('chatbot') 
  const [routes, setRoutes] = useState(null) 
  const [startPoint, setStartPoint] = useState("") 
  const [endPoint, setEndPoint] = useState("") 

  const [testShow, setTestShow] = useState(false) 

  const [messageList, setMessageList] = useState([
    {
      content: "You are a route recommender that extract user needs on route from conversation with user. User will provide their initial need (including time and need). You can ask some questiosn if there is something unclear. Ask at most 3 questions. After 3 questions, you should always reply 'OK'. ",
      role: "system"
    }
  ]);

  const postOpenAI = async (conversation) => {
    console.log("POST TO OPENAI")
    const result = await fetch("http://101.32.54.185:5000/chatbot", {
      method: "POST",
      body: JSON.stringify(conversation),
      headers: {
        "Content-Type": "application/json",
      }
    });
    const resultJson = await result.json();
    return resultJson.choices[0].message;
  } 

  const generateRoute = async () => {
    console.log("Generate Route");
    const currentMessageList = [
      ...messageList,
      {
        content: "Now, you are a new assistant. Based on the whole conversation above and the additional information provided, please now evaluate the user need in terms of the following indicators. Give a value between -15 and 15 for each indicator and higher value means that the user is likely to have that need. 1. Longer Distance 2.Streetlight 3.Stairs 4.Escalator 5.Lift 6.Tactile Paving 7.Ramp 8.Green Space 9.Slope-free 10.Sea view 11.Air Conditioning 12.Shaded from sunlight 13.Shelter from rain.  Also report the user's destination. Your entire response/output is going to consist of a single JSON object object in the form of {\"destination\": \"\", \"indicators\": {\"Longer Distance\": \"\", \"Streetlight\": \"\", \"Stairs\": \"\", \"Escalator\": \"\",\"Lift\": \"\", \"Tactile Paving\": \"\", \"Ramp\": \"\", \"Green Space\": \"\", \"Slope-free\": \"\", \"Sea view\": \"\", \"Air Conditioning\": \"\", \"Shaded from sunlight\": \"\", \"Shelter from rain\": \"\"}}, and you will NOT wrap it within JSON md markers",
        role: "user",
      },
    ];

    const responseFromAI = await postOpenAI(currentMessageList);

    setMessageList((prev) => ([
      ...prev,
      {
        content: "Now, you are a new assistant. Based on the whole conversation above and the additional information provided, please now evaluate the user need in terms of the following indicators. Give a value between -15 and 15 for each indicator and higher value means that the user is likely to have that need. 1. Longer Distance 2.Streetlight 3.Stairs 4.Escalator 5.Lift 6.Tactile Paving 7.Ramp 8.Green Space 9.Slope-free 10.Sea view 11.Air Conditioning 12.Shaded from sunlight 13.Shelter from rain.  Also report the user's destination. Your entire response/output is going to consist of a single JSON object object in the form of {\"destination\": \"\", \"indicators\": {\"Longer Distance\": \"\", \"Streetlight\": \"\", \"Stairs\": \"\", \"Escalator\": \"\",\"Lift\": \"\", \"Tactile Paving\": \"\", \"Ramp\": \"\", \"Green Space\": \"\", \"Slope-free\": \"\", \"Sea view\": \"\", \"Air Conditioning\": \"\", \"Shaded from sunlight\": \"\", \"Shelter from rain\": \"\"}}, and you will NOT wrap it within JSON md markers",
        role: "user"
      },
      responseFromAI,
    ]));

    const needsAnalysisResult = JSON.parse(responseFromAI.content);
    console.log(needsAnalysisResult)
    const weights = Object.values(needsAnalysisResult.indicators).map((indicator_value, i) => {
      if (i>=2 && i<=5) {
        return -Number(indicator_value);
      }
      return Number(indicator_value);
    })
    console.log(weights);


    // Generate Route
    const routes = await fetch("http://101.32.54.185:5000/routegenerator", {
      method: "POST",
      body: JSON.stringify({
        from: "West Gate（A2）",
        to: needsAnalysisResult.destination,
        user_id: 1,
        weights: weights,
      }),
      headers: {
        "Content-Type": "application/json",
      }
    });
    const routesJson = await routes.json();
    console.log(routesJson)
    
    setStartPoint("West Gate（A2）")
    setEndPoint(needsAnalysisResult.destination)
    setRoutes(routesJson);
    setCurrentPage('result')
  }

  // useEffect(
  //   ()=>{
  //     testOpenAI();
  //   }
  // ) 

  
  
  return (
    <div className="App">
      <Flex gap="middle" vertical style={{ height: "100%" }}>
        {/* <Input placeholder="Please Enter the API Key for ChatGPT" /> */}
        <Flex vertical={false} justify="space-around" style={{ height: "100%",  alignItems: "center"}} >
          <Card
            title="User View"
            bordered={false}
            style={{ width: 400, height: 750, overflowY: "scroll" }}
          >
            {currentPage === "chatbot" ? (
              <Flex vertical={true}>
                <Flex
                  justify="flex-end"
                  vertical={false}
                  style={{
                    backgroundColor: "rgb(240, 242, 245)",
                    padding: "15px 15px",
                  }}
                >
                  <Button
                    onClick={generateRoute}
                    type="primary"
                    icon={<ArrowRightOutlined />}
                  >
                    Generate Routes
                  </Button>
                </Flex>
                <Chatbot
                  config={config}
                  messageParser={MessageParser}
                  actionProvider={({
                    createChatBotMessage,
                    setState,
                    children,
                  }) => {
                    return ActionProvider(
                      { createChatBotMessage, setState, children },
                      setMessageList,
                      messageList,
                      postOpenAI
                    );
                  }}
                />
              </Flex>
            ) : null}
            {currentPage === "result" ? (
              <Flex vertical={true}>
                <Flex
                  justify="flex-start"
                  vertical={false}
                  style={{
                    backgroundColor: "rgb(240, 242, 245)",
                    padding: "15px 15px",
                    marginBottom: "15px"
                  }}
                >
                  <Button
                    onClick={()=>{
                      window.location.reload(false);
                    }}
                    icon={<ArrowLeftOutlined />}
                  >
                    Reload
                  </Button>
                </Flex>
                <Card type="inner" title="Route 1" style={{ margin: "10px 0px" }}>
                  {routes ?
                    <Map path={routes['path1']} start={startPoint} end={endPoint} />
                    : null}
                  {routes ?
                    <p>{JSON.stringify(routes['path1']['path'])}</p>
                    : null}
                  {routes ?
                    <p>{JSON.stringify(routes['path1']['edges'])}</p>
                    : null}
                </Card>
                <Card type="inner" title="Route 2 (with Clustering Result)" style={{ margin: "10px 0px" }}>
                  {routes ?
                    <Map path={routes['path2']} start={startPoint} end={endPoint} />
                    : null}
                  {routes ?
                    <p>{JSON.stringify(routes['path2']['path'])}</p>
                    : null}
                  {routes ?
                    <p>{JSON.stringify(routes['path2']['edges'])}</p>
                    : null}
                </Card>
              </Flex>
            ) : null}
          </Card>
          <Card
            title="Backend Conversation with GPT (Not Visible to User)"
            bordered={false}
            style={{ width: 700, height: 700 }}
          >
            {messageList.map((eachMessage) => {
              return (
                <p>
                  <strong>{eachMessage.role}</strong>: {eachMessage.content}
                </p>
              );
            })}
          </Card>
        </Flex>
      </Flex>
      <Row justify="space-evenly">
        <Col span={6}></Col>
        <Col span={6}></Col>
      </Row>
    </div>
  );
}

export default App;
