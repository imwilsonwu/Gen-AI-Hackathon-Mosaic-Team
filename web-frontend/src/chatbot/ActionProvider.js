import React from "react";

const ActionProvider = ({ createChatBotMessage, setState, children}, setMessageList, messageList, postOpenAI) => {
  const sendToGPT = async (userMessage) => {
    console.log(userMessage);

    const currentMessageList = [
      ...messageList,
      {
        content: userMessage,
        role: "user",
      },
    ];

    const responseFromAI = await postOpenAI(currentMessageList);

    setMessageList((prev) => ([
      ...prev,
      {
        content: userMessage,
        role: "user"
      },
      responseFromAI,
    ]));

    const botMessage = createChatBotMessage(responseFromAI.content);

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            sendToGPT,
          },
        });
      })}
    </div>
  );
};

export default ActionProvider;
