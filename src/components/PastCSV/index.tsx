/*
 * @Author: gaoyang334 gaoyang334@jd.com
 * @Date: 2025-07-03 11:01:33
 * @LastEditors: gaoyang334 gaoyang334@jd.com
 * @LastEditTime: 2025-07-07 21:25:41
 * @FilePath: /light/src/App.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useEffect } from 'react';
import styles from './index.module.css';
import test from './test.json'

function App() {
  // excel paste
  const [pastJson, setPastJson] = React.useState<any>('');
  const dropArea = document.getElementById('dropArea') as HTMLElement;

  async function convertPastToJson(file: File) {
    if (!file) return;
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      setPastJson('converting...');

      const response = await fetch('http://localhost:4000/api/excel-to-json', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Conversion failed');
      }

      const data = await response.json();
      setPastJson((JSON.stringify(data)));
      const res = transformItems(data.data);
      setList(res);
    } catch (error) {
      setPastJson('Error');
    }
  }

  // 防止默认拖放行为
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea?.addEventListener(eventName, preventDefaults, false);
    document.body?.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
  }

  // 高亮显示拖放区域
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea?.addEventListener(eventName, highlight, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea?.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropArea.style.borderColor = '#4CAF50';
    dropArea.style.backgroundColor = '#e8f5e9';
  }

  function unhighlight() {
    dropArea.style.borderColor = '#ccc';
    dropArea.style.backgroundColor = '#f9f9f9';
  }

  // 处理文件拖放
  dropArea?.addEventListener('drop', handleDrop, false);

  function handleDrop(e: any) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length) {
      handleFiles(files);
    }
  }

  // 处理文件选择或粘贴
  dropArea?.addEventListener('paste', handlePaste, false);

  function handlePaste(e: any) {
    const items = (e.clipboardData || window?.Clipboard).items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        handleFiles([file] as any);
        break;
      }
    }
  }

  function handleFiles(files: FileList) {
    const file = files[0];
    if (!file) return;
    convertPastToJson(file);
  }

  // 处理JSON
  const [list, setList] = React.useState<{ type: string; count?: number; color?: string; content?: string; endsWith?: string }[][] >([]);
  function transformItems(items: {
    itemID: string;
    itemName: string;
    desc: string;
    make?: string;
  }[]) {
    if(!items) return [];
    return items?.map(item => {
      // 1. 处理itemName
      const itemName = item.itemName.replace(/^\|c[0-9A-F]{8}|\|r$/g, '');
      const colorMatch = item.itemName.match(/^\|c00([0-9A-F]{6})/i);
      const itemNameColor = colorMatch ? '#' + colorMatch[1] : '';
      // 2. 加入换行
      // 3. 处理desc
      const text = item.desc;
      const segments = [];
      // const regex = /\|c([0-9A-F]{8})(.*?)\|r(\|n)*/g;
      const regex = /\|c[0-9A-F]{2}([0-9A-F]{6})(.*?)\|r(\|n)*/g;

      let match;
      let lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        const [fullMatch, colorCode, content, lineBreaks] = match;
        segments.push({
          type: 'color-block',
          color: `#${colorCode}`,  // 8位颜色代码（含透明度）
          content: content,        // 文本内容
          endsWith: lineBreaks ? 'newline' : 'end'  // 是否以换行符结尾
        });
        lastIndex = match.index + fullMatch.length;
      }

      // 检查是否有未匹配的纯文本
      if (lastIndex < text.length) {
        segments.push({
          type: 'plain-text',
          content: text.slice(lastIndex),
          endsWith: 'end'
        });
      }
      return [{
        type: "color-block",
        color: itemNameColor,
        content: itemName,
        endsWith: "newline"
      }, {
        type: "newline",
        count: 1 // 连续2个 |n
      }, ...segments];
    });
  }

  // 使用示例
  // const transformedItems: { type: string; count?: number; color?: string; content?: string; endsWith?: string }[][] = transformItems(test.data);
  // console.log((transformedItems), 'transformedItems');
  return (
    <div>
      <h4>Excel PAST</h4>
      <div className={styles.instructions}>
        <p>请将 Excel 文件粘贴到下方区域，或直接拖放 Excel 文件到指定区域</p>
      </div>
      <div id="dropArea" className={styles.container}>
        <p style={{ color: '#000', fontSize: '16px' }}>将 Excel 文件拖放到此处，或在此区域粘贴 Excel 数据</p>
      </div>
      <div id="output">{pastJson}</div>

      <h4>CONVERT TO</h4>
      {
        list.map(item => {
          return (<div className={styles.skills}>
            {item.map(element => {
              return element.type === 'color-block' ? (<div>
                <span className={styles.title} style={{ color: element.color }}>{element.content}</span>
                {element.endsWith === 'newline' && <br />}
              </div>) : element.type === 'newline' ? <br /> : null
            })}
          </div>)
        })
      }

    </div>
  );
}

export default App;
