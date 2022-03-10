import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {RSocketConnector} from "@rsocket/core";
import {encodeCompositeMetadata, encodeRoute, WellKnownMimeType} from "@rsocket/composite-metadata";
import {WebsocketClientTransport} from "@rsocket/transport-websocket-client";

function App() {


  useEffect(() => {
    // Using an IIFE
    (async function anyNameFunction() {
      const connector = new RSocketConnector({
        transport: new WebsocketClientTransport({
          url: "ws://localhost:19999",
          wsCreator: (url) => new WebSocket(url) as any,
        }),
        setup: {
          dataMimeType: WellKnownMimeType.APPLICATION_JSON.string,
          metadataMimeType: WellKnownMimeType.MESSAGE_RSOCKET_COMPOSITE_METADATA.string,
          keepAlive: 1000000,
          lifetime: 100000,
          payload: {
            data: null,
            // please supply app metadata
            metadata: encodeCompositeMetadata([
              [
                "message/x.rsocket.application+json",
                Buffer.from(
                    JSON.stringify({
                      name: "demo-app",
                    })
                ),
              ],
            ]),
          },
        },
      });

      const rsocket = await connector.connect();

      await new Promise((resolve, reject) =>
          rsocket.requestResponse(
              {
                data: Buffer.from(JSON.stringify([1])),
                metadata: encodeCompositeMetadata([
                  [
                    WellKnownMimeType.MESSAGE_RSOCKET_ROUTING,
                    encodeRoute("com.alibaba.user.UserService.findById"),
                  ],
                ]),
              },
              {
                onError: (e) => reject(e),
                onNext: (payload, isComplete) => {
                  console.info(JSON.parse(payload.data?.toString()!))
                },
                onComplete: () => {
                  resolve(null);
                },
                onExtension: () => {},
              }
          )
      )
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
