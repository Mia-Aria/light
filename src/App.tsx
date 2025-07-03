/*
 * @Author: gaoyang334 gaoyang334@jd.com
 * @Date: 2025-07-03 11:01:33
 * @LastEditors: gaoyang334 gaoyang334@jd.com
 * @LastEditTime: 2025-07-03 21:03:51
 * @FilePath: /light/src/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [input, setInput] = React.useState<number>(1);
  const [data, setData] = React.useState<any>('');
  const fetchData = async (key: number) => {
    if(typeof key !== 'number') {
      return;
    }
    await fetch(`http://182.92.182.238:4000/api/users/${key}`).then(res => {
      return res.json();
    }).then(
      res => {
        setData(res);
      }
    )
  }

  React.useEffect(() => {
    fetchData(input);
  }, [input]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Dark in Light
        </p>
        <p>
          Please input a number~
        </p>
        <input type="number" value={input} onChange={(e) => setInput(Number(e.target.value))} />
        <p>
          {JSON.stringify(data)}  
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn DarkinLight
        </a>
      </header>
    </div>
  );
}

export default App;
