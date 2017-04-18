const readline = require('readline');
const fs = require('fs');

subdomainFromList(process.argv[2])
  .then(list => {
    console.log('Using suffix list: ' + list);
  })
  .catch(err => {
    console.log('Failed using suffix list:', err.message);
  });

console.log('Using regex: ' + subdomainFromRegex(process.argv[2]));

function subdomainFromRegex(string) {
  const matches = string.match(/[^.]*\.[^.]{1,4}(?:\.[^.]*)?$/);
  if (matches)
    return matches[0];
  else
    return 'not found';
};

function subdomainFromList(string) {
  return new Promise((resolve, reject) => {
    const listFile = 'list.txt';
    fs.stat(listFile, (err, stats) => {
      if (err) {
        throw err;
      } else if (!stats.isFile()) {
        reject(new Error('list could not be read'));
      } else {
        const list = [];
        const rl = readline.createInterface({
          input: fs.createReadStream(listFile, 'utf8')
        });
        rl.on('line', (line) => {
          const comment = new RegExp('^//');
          let suffixRegex;
          let suffix;
          if (!comment.test(line) && !/^\s*$/.test(line)) {
            if (/^\*/.test(line)) {
              suffix = line.slice(1);
              suffixRegex = new RegExp('([^.]*.[^.]*' + suffix + '$)');
            } else if (/^!/.test(line)) {
              suffix = line.slice(1);
              suffixRegex = new RegExp('([^.]*.' + suffix + '$)');
            } else {
              suffixRegex = new RegExp('([^.]*.' + line + '$)');
              suffix = line;
            }
            const matches = string.match(suffixRegex);
            if (matches) {
              // console.log(matches, suffixRegex);
              for (let i = list.length - 1; i >= 0; i--) {
                const checkDouble = new RegExp('^' + suffix + '$');
                if (list[i].match(checkDouble))
                  list.splice(i, 1);
              }
              list.push(matches[1]);
            }
          }
        });
        rl.on('close', () => {
          if (list.length > 0) {
            const result = Array.from(new Set(list));
            resolve(result);
          } else {
            resolve('not found');
          }
        });
      }
    });
  });
};
