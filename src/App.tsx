/*
 * @Author: gaoyang334 gaoyang334@jd.com
 * @Date: 2025-07-03 11:01:33
 * @LastEditors: gaoyang334 gaoyang334@jd.com
 * @LastEditTime: 2025-07-07 17:53:46
 * @FilePath: /light/src/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import logo from './logo.svg';
import './App.css';
import PastCSV from './components/PastCSV';

function App() {
  const [input, setInput] = React.useState<string>('');
  const [data, setData] = React.useState<any>('');
  const [list, setList] = React.useState<any>('');

  const path = process.env.NODE_ENV === 'production' ? 'http://182.92.182.238:4000' : 'http://localhost:4000';
  
  const fetchList = async () => {
    try{
      await fetch(`${path}/api/users`).then(res => {
        return res.json();
      }).then(
        res => {
          setList(res);
        }
      )
    }catch(err){
      console.log(err, 'fetchList')
    }
  }
  const fetchData = async (key: string) => {
    try{
      await fetch(`${path}/api/users/${key}`).then(res => {
        return res.json();
      }).then(
        res => {
          setData(res);
        }
      )
    }catch(err){
      console.log(err, 'fetchData')
    }
  }

  React.useEffect(() => {
    fetchData(input);
  }, [input]);

  React.useEffect(() => {
    fetchList();
  }, []);

  // excel to json
  const [json, setJson] = React.useState<any>('');
  async function convertToJson() {
    const fileInput = document.getElementById('fileInput')  as HTMLInputElement;
    if (!fileInput) return;
    const file = fileInput?.files?.[0] as File;
    if (!file) return;
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      setJson('converting...');
      
      const response = await fetch('http://localhost:4000/api/excel-to-json', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data = await response.json();
      setJson(JSON.stringify(data));
    } catch (error) {
      setJson('Error');
    }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Dark in Light Utils</h2>
        <p>
          Please input a name~
        </p>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} />
        <p>
          {JSON.stringify(data)}  
        </p>
        ====================================================================================
        <p>
          All users
        </p>
        <p>
          {JSON.stringify(list)}  
        </p>
        ====================================================================================
        <h4>Convert Excel to JSON</h4>
        <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" />
        <button onClick={() => convertToJson()}>Convert to JSON</button>
        <br />
        <div id="result">{json}</div>
        ====================================================================================
        <PastCSV />
      </header>
    </div>
  );
}

export default App;
