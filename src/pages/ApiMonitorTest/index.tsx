import React from 'react';

const ApiMonitorTest = () => {
  const getCurrentPosition = () => {
    navigator.geolocation.getCurrentPosition(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  };

  const watchPosition = () => {
    navigator.geolocation.watchPosition(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  };

  const setClipboard = () => {
    const data = [];
    data.push(new ClipboardItem({ 'text/plain': 'html' }));
    void navigator.clipboard.write(data);
  };

  const getClipboard = async () => {
    const res = await navigator.clipboard.read();
    console.log(res);
  };

  const setClipboardText = () => {
    void navigator.clipboard.writeText('Test Clipboard');
  };

  const getClipboardText = async () => {
    const res = await navigator.clipboard.readText();
    console.log(res);
  };

  const getUserMedia = async () => {
    const res = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log(res);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h3>This is a test Page</h3>
      <p
        style={{
          width: 1000,
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => {
            getCurrentPosition();
          }}
        >
          getLocation
        </button>
        <button
          onClick={() => {
            watchPosition();
          }}
        >
          watchPosition
        </button>
        <button
          onClick={() => {
            setClipboardText();
          }}
        >
          setClipboardText
        </button>
        <button
          onClick={() => {
            void getClipboardText();
          }}
        >
          getClipboardText
        </button>
        <button
          onClick={() => {
            setClipboard();
          }}
        >
          setClipboard
        </button>
        <button
          onClick={() => {
            void getClipboard();
          }}
        >
          getClipboard
        </button>
        <button
          onClick={() => {
            void getUserMedia();
          }}
        >
          getUserMedia
        </button>
      </p>
    </div>
  );
};

export default ApiMonitorTest;
