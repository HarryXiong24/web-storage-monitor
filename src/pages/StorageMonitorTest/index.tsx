import React from 'react';

const StorageMonitorTest = () => {
  const setLocalStorage1 = () => {
    localStorage.setItem('test-localStorage1', '12342');
  };

  const removeLocalStorage1 = () => {
    localStorage.removeItem('test-localStorage1');
  };

  const changeLocalStorage1 = () => {
    localStorage.setItem('test-localStorage1', '98765');
  };

  const setLocalStorage2 = () => {
    localStorage.setItem('test-localStorage2', '323432');
  };

  const removeLocalStorage2 = () => {
    localStorage.removeItem('test-localStorage2');
  };

  const setSessionStorage1 = () => {
    localStorage.setItem('test-sessionStorage1', 'wewe');
  };

  const removeSessionStorage1 = () => {
    localStorage.removeItem('test-sessionStorage1');
  };

  const setSessionStorage2 = () => {
    localStorage.setItem('test-sessionStorage2', 'qqytu');
  };

  const removeSessionStorage2 = () => {
    localStorage.removeItem('test-sessionStorage2');
  };

  const setCookie1 = () => {
    document.cookie = 'userId=nick123; expires=Wed, 15 Jan 2020 12:00:00 UTC;';
  };

  const setCookie2 = () => {
    document.cookie =
      'userId=harryxiong24; expires=Wed, 15 Jan 2020 12:00:00 UTC;';
  };

  const setCookie3 = () => {
    document.cookie = 'expires=Wed, 15 Jan 2020 12:00:00 UTC;';
  };

  const setCookie4 = () => {
    document.cookie =
      'MONITOR_WEB_ID=9910b0c5b; X-Risk-Browser-Id=d53369d40abb7451f25fed90a809; Token=gVfolCZeXfr-te8jlSoFtIxK_XAf1UA3lsMyyrOCmclz_OVSY=; x-uuid=168978; MONITOR_WEB_ID=bd4a2dcb-5721-4b3409c47';
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
            setLocalStorage1();
          }}
        >
          set-test-localStorage1
        </button>
        <button
          onClick={() => {
            removeLocalStorage1();
          }}
        >
          remove-test-localStorage1
        </button>
        <button
          onClick={() => {
            changeLocalStorage1();
          }}
        >
          change-test-localStorage1
        </button>
        <button
          onClick={() => {
            setLocalStorage2();
          }}
        >
          set-test-localStorage2
        </button>
        <button
          onClick={() => {
            removeLocalStorage2();
          }}
        >
          remove-test-localStorage2
        </button>
      </p>
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
            setSessionStorage1();
          }}
        >
          set-test-sessionStorage1
        </button>
        <button
          onClick={() => {
            removeSessionStorage1();
          }}
        >
          remove-test-sessionStorage1
        </button>
        <button
          onClick={() => {
            setSessionStorage2();
          }}
        >
          set-test-sessionStorage1
        </button>
        <button
          onClick={() => {
            removeSessionStorage2();
          }}
        >
          remove-test-sessionStorage2
        </button>
      </p>
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
            setCookie1();
          }}
        >
          set-cookie1
        </button>
        <button
          onClick={() => {
            setCookie2();
          }}
        >
          set-cookie2
        </button>
        <button
          onClick={() => {
            setCookie3();
          }}
        >
          set-cookie3
        </button>
        <button
          onClick={() => {
            setCookie4();
          }}
        >
          set-cookie4
        </button>
      </p>
    </div>
  );
};

export default StorageMonitorTest;
